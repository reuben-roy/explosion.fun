'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Terminal.module.css';
import { FEATURES } from '@/config/features';

const PROMPT = 'guest@explosion.fun:~$';

// Boot banner printed (typed out) on mount.
const BANNER = [
  'explosion.fun // a playground of experiments, data toys & ranked reviews',
  "type 'help' to get started, or just click the cards below.",
];

// Build a quick lookup of command -> feature, including aliases.
const FEATURE_BY_COMMAND = FEATURES.reduce((acc, feature) => {
  acc[feature.command] = feature;
  (feature.aliases || []).forEach((alias) => {
    acc[alias] = feature;
  });
  return acc;
}, {});

export default function Terminal() {
  const router = useRouter();
  const [bootText, setBootText] = useState(''); // typewriter banner (one growing string)
  const [lines, setLines] = useState([]); // { type: 'output' | 'input' | 'error', text }
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [booted, setBooted] = useState(false);

  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const startedRef = useRef(false);

  // Type out the boot banner one character at a time, then reveal the input.
  // A single monotonic slice index keeps this robust under React Strict Mode's
  // double-invoked effects; the ref guard ensures only one typing chain runs.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const full = BANNER.join('\n');
    let i = 0;

    const tick = () => {
      i += 1;
      setBootText(full.slice(0, i));
      if (i >= full.length) {
        setBooted(true);
        return;
      }
      // Pause a touch longer at line breaks for a natural cadence.
      setTimeout(tick, full[i - 1] === '\n' ? 220 : 16);
    };

    setTimeout(tick, 300);
  }, []);

  // Keep the view scrolled to the latest line.
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines, bootText]);

  const print = (entries) => {
    setLines((prev) => [...prev, ...entries]);
  };

  const runCommand = (raw) => {
    const trimmed = raw.trim();
    // Echo the command the user typed.
    print([{ type: 'input', text: `${PROMPT} ${trimmed}` }]);

    if (trimmed === '') return;

    setHistory((prev) => [...prev, trimmed]);

    const [command, ...args] = trimmed.split(/\s+/);
    const name = command.toLowerCase();

    if (name === 'clear') {
      setLines([]);
      setBootText('');
      return;
    }

    if (name === 'help') {
      print([
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  help            show this message' },
        { type: 'output', text: '  ls              list everything on this site' },
        ...FEATURES.map((f) => ({
          type: 'output',
          text: `  ${f.command.padEnd(15)} open ${f.title}`,
        })),
        { type: 'output', text: '  about           about this site' },
        { type: 'output', text: '  whoami          who am I?' },
        { type: 'output', text: '  clear           clear the screen' },
      ]);
      return;
    }

    if (name === 'ls') {
      print(
        FEATURES.map((f) => ({
          type: 'output',
          text: `${f.command.padEnd(16)} ${f.description}`,
        }))
      );
      return;
    }

    if (name === 'about') {
      print([{ type: 'output', text: 'opening /about ...' }]);
      router.push('/about');
      return;
    }

    if (name === 'whoami') {
      print([{ type: 'output', text: 'guest — welcome, wanderer. make yourself at home.' }]);
      return;
    }

    if (name === 'echo') {
      print([{ type: 'output', text: args.join(' ') }]);
      return;
    }

    if (name === 'date') {
      print([{ type: 'output', text: new Date().toString() }]);
      return;
    }

    // `cd <feature>` behaves like running the feature command.
    const target = name === 'cd' ? (args[0] || '').toLowerCase() : name;
    const feature = FEATURE_BY_COMMAND[target];
    if (feature) {
      print([{ type: 'output', text: `opening ${feature.path} ...` }]);
      router.push(feature.path);
      return;
    }

    print([
      { type: 'error', text: `command not found: ${command} — type 'help'` },
    ]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      runCommand(input);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className={styles.terminal} onClick={focusInput}>
      <div className={styles.titleBar}>
        <span className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </span>
        <span className={styles.titleText}>{PROMPT.replace('$', '')}</span>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {bootText && <div className={styles.line}>{bootText}</div>}

        {lines.map((line, index) => (
          <div
            key={index}
            className={`${styles.line} ${
              line.type === 'input'
                ? styles.commandLine
                : line.type === 'error'
                ? styles.errorLine
                : ''
            }`}
          >
            {line.text}
          </div>
        ))}

        <div className={styles.inputLine} aria-hidden={!booted}>
          <span className={styles.promptLabel}>{PROMPT}</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!booted}
            aria-label="Terminal command input. Type help and press Enter for a list of commands."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <span className={styles.caret} />
        </div>
      </div>
    </div>
  );
}
