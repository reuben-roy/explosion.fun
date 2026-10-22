"""Render the curated two-page CV. Requires reportlab: python3 scripts/generate-cv-pdf.py."""
from pathlib import Path
import re
import shutil
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/pdf/reuben-roy-cv.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
styles = {
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=colors.HexColor('#16324a'), spaceAfter=5),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor('#176b87'), spaceBefore=12, spaceAfter=6, keepWithNext=True),
    'heading': ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceBefore=7, spaceAfter=4, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.3, leading=12.8, spaceAfter=5),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.8, leftIndent=10, firstLineIndent=-8, spaceAfter=4),
}
def inline(text):
    text = escape(text)
    return re.sub(r'\[([^\]]+)\]\((https://[^)]+)\)', r'<link href="\2" color="#176b87">\1</link>', text)

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#d4dce3'))
    canvas.line(42, 35, 570, 35)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#586776'))
    canvas.drawString(42, 23, 'REUBEN ROY  |  CV  |  OCTOBER 2026')
    canvas.drawRightString(570, 23, str(doc.page))

story=[]
for line in (ROOT/'src/content/cv-print.md').read_text().splitlines():
    if not line.strip(): continue
    if line == '---page---': story.append(PageBreak()); continue
    kind='body'
    for prefix, name in [('### ', 'heading'), ('## ', 'section'), ('# ', 'title'), ('- ', 'bullet')]:
        if line.startswith(prefix):
            kind=name; line=line[len(prefix):]
            if name=='bullet': line='- '+line
            break
    story.append(Paragraph(inline(line), styles[kind]))
SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=42, leftMargin=42, topMargin=35, bottomMargin=47, title='Reuben Roy - Curriculum Vitae', author='Reuben Roy').build(story,onFirstPage=footer,onLaterPages=footer)
shutil.copyfile(OUTPUT, ROOT/'public/reuben-roy-cv.pdf')
print(OUTPUT)
