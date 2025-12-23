'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import DropdownMenu from './DropdownMenu';
import ProjectsDropdown from './ProjectsDropdown';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setExpandedSection(null); // Reset expanded sections when menu closes
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const navItems = [
        { href: '/blog', label: 'Blog' },
        { href: '/blog/ranked', label: 'Ranked' },
        { 
            label: 'Projects', 
            isExpandable: true,
            id: 'projects',
            children: [
                { href: '/projects', label: 'All Projects' },
                { href: '/side-track', label: 'Side-Track' },
            ]
        },
        { href: '/career', label: 'Career' },
        { href: '/about', label: 'About' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo} onClick={closeMenu}>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={150}
                        height={40}
                    />
                </Link>
                
                {/* Desktop Navigation */}
                <div className={styles.desktopLinks}>
                    <Link 
                        href="/blog" 
                        className={`${styles.link} ${pathname === '/blog' ? styles.activeLink : ''}`}
                    >
                        Blog
                    </Link>
                    <DropdownMenu onClose={closeMenu} />
                    <ProjectsDropdown onClose={closeMenu} />
                    <Link 
                        href="/career" 
                        className={`${styles.link} ${pathname === '/career' ? styles.activeLink : ''}`}
                    >
                        Career
                    </Link>
                    <Link 
                        href="/about" 
                        className={`${styles.link} ${pathname === '/about' ? styles.activeLink : ''}`}
                    >
                        About
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className={styles.menuLine}></span>
                    <span className={styles.menuLine}></span>
                    <span className={styles.menuLine}></span>
                </button>

                {/* Mobile Menu Overlay */}
                <div 
                    className={`${styles.overlay} ${isMenuOpen ? styles.overlayActive : ''}`}
                    onClick={closeMenu}
                    aria-hidden="true"
                />

                {/* Mobile Bottom Sheet Menu */}
                <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuActive : ''}`}>
                    <div className={styles.mobileMenuHandle} />
                    <div className={styles.mobileMenuContent}>
                        {navItems.map((item, index) => (
                            item.isExpandable ? (
                                <div 
                                    key={item.id} 
                                    className={styles.mobileExpandable}
                                    style={{ '--delay': `${index * 0.05}s` }}
                                >
                                    <button
                                        className={`${styles.mobileLink} ${styles.mobileExpandableButton} ${expandedSection === item.id ? styles.mobileExpandableOpen : ''}`}
                                        onClick={() => toggleSection(item.id)}
                                        aria-expanded={expandedSection === item.id}
                                    >
                                        <span className={styles.mobileLinkText}>{item.label}</span>
                                        <span className={`${styles.mobileLinkChevron} ${expandedSection === item.id ? styles.chevronUp : ''}`}>
                                            ▾
                                        </span>
                                    </button>
                                    <div className={`${styles.mobileSubMenu} ${expandedSection === item.id ? styles.mobileSubMenuOpen : ''}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`${styles.mobileSubLink} ${pathname === child.href ? styles.mobileLinkActive : ''}`}
                                                onClick={closeMenu}
                                            >
                                                <span className={styles.mobileSubLinkText}>{child.label}</span>
                                                <span className={styles.mobileLinkArrow}>→</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.mobileLink} ${pathname === item.href ? styles.mobileLinkActive : ''}`}
                                    onClick={closeMenu}
                                    style={{ '--delay': `${index * 0.05}s` }}
                                >
                                    <span className={styles.mobileLinkText}>{item.label}</span>
                                    <span className={styles.mobileLinkArrow}>→</span>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}