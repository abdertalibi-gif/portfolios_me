# -*- coding: utf-8 -*-
"""Drawing helpers + native PowerPoint timing engine."""
from lxml import etree
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.oxml.ns import qn, nsdecls
from pptx.oxml import parse_xml

# ----------------------------------------------------------------- palette
NAVY_0 = "050B1A"
NAVY_1 = "071127"
NAVY_2 = "0A1733"
PANEL = "0D1730"
PANEL_2 = "122043"
WHITE = "F5F8FF"
MUTED = "9AA9C2"
DIM = "6B7A94"
CYAN = "22D3EE"
CYAN_2 = "00C8FF"
BLUE = "3B82F6"
VIOLET = "8B5CF6"
VIOLET_2 = "A78BFA"
EMERALD = "34D399"
AMBER = "FBBF24"
ROSE = "FB7185"

FONT = "Segoe UI"


def I(v):
    return Inches(v)


def _rgb(hex6):
    return RGBColor.from_string(hex6)


_FILL_TAGS = ("a:noFill", "a:solidFill", "a:gradFill", "a:blipFill",
              "a:pattFill", "a:grpFill")


def _strip_fill(spPr):
    for tag in _FILL_TAGS:
        for e in spPr.findall(qn(tag)):
            spPr.remove(e)


def set_solid(shape, color, alpha=None):
    spPr = shape._element.spPr
    _strip_fill(spPr)
    a = "" if alpha is None else '<a:alpha val="%d"/>' % int(alpha * 1000)
    xml = '<a:solidFill %s><a:srgbClr val="%s">%s</a:srgbClr></a:solidFill>' % (
        nsdecls("a"), color, a)
    new = parse_xml(xml)
    geom = spPr.find(qn("a:prstGeom"))
    if geom is not None:
        geom.addnext(new)
    else:
        spPr.append(new)


def set_radial(shape, color, alpha=26, mid=18):
    spPr = shape._element.spPr
    _strip_fill(spPr)
    xml = (
        '<a:gradFill %s rotWithShape="1"><a:gsLst>'
        '<a:gs pos="0"><a:srgbClr val="%s"><a:alpha val="%d"/></a:srgbClr></a:gs>'
        '<a:gs pos="60000"><a:srgbClr val="%s"><a:alpha val="%d"/></a:srgbClr></a:gs>'
        '<a:gs pos="100000"><a:srgbClr val="%s"><a:alpha val="0"/></a:srgbClr></a:gs>'
        '</a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>'
        % (nsdecls("a"), color, int(alpha * 1000), color,
           int(alpha * mid / 100 * 1000), color)
    )
    new = parse_xml(xml)
    geom = spPr.find(qn("a:prstGeom"))
    if geom is not None:
        geom.addnext(new)
    else:
        spPr.append(new)


def set_line(shape, color=None, width=1.0, alpha=None, dash=None,
             head=False, tail=False):
    spPr = shape._element.spPr
    old = spPr.find(qn("a:ln"))
    if color is None:
        xml = '<a:ln %s><a:noFill/></a:ln>' % nsdecls("a")
    else:
        a = "" if alpha is None else '<a:alpha val="%d"/>' % int(alpha * 1000)
        d = '<a:prstDash val="%s"/>' % dash if dash else ""
        h = '<a:headEnd type="triangle" w="sm" len="sm"/>' if head else ""
        t = '<a:tailEnd type="triangle" w="sm" len="sm"/>' if tail else ""
        xml = ('<a:ln %s w="%d" cap="flat"><a:solidFill><a:srgbClr val="%s">%s</a:srgbClr>'
               '</a:solidFill>%s<a:round/>%s%s</a:ln>'
               % (nsdecls("a"), int(Pt(width)), color, a, d, h, t))
    new = parse_xml(xml)
    if old is not None:
        spPr.replace(old, new)
    else:
        anchor = None
        for tag in _FILL_TAGS:
            e = spPr.find(qn(tag))
            if e is not None:
                anchor = e
        if anchor is not None:
            anchor.addnext(new)
        else:
            spPr.append(new)


def _base(slide, shape_type, x, y, w, h):
    shp = slide.shapes.add_shape(shape_type, I(x), I(y), I(w), I(h))
    shp.shadow.inherit = False
    tf = shp.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.auto_size = MSO_AUTO_SIZE.NONE
    return shp


def rect(slide, x, y, w, h, fill=None, line=None, line_w=1.0, radius=None,
         alpha=None, dash=None, line_alpha=None):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius is not None else MSO_SHAPE.RECTANGLE
    shp = _base(slide, kind, x, y, w, h)
    if radius is not None:
        shp.adjustments[0] = radius
    if fill is None:
        shp.fill.background()
    else:
        set_solid(shp, fill, alpha)
    if line is None:
        shp.line.fill.background()
    else:
        set_line(shp, line, line_w, alpha=line_alpha, dash=dash)
    return shp


def oval(slide, x, y, w, h, fill=None, line=None, line_w=1.0, alpha=None):
    shp = _base(slide, MSO_SHAPE.OVAL, x, y, w, h)
    if fill is None:
        shp.fill.background()
    else:
        set_solid(shp, fill, alpha)
    if line is None:
        shp.line.fill.background()
    else:
        set_line(shp, line, line_w)
    return shp


def glow(slide, cx, cy, r, color, alpha=24):
    shp = _base(slide, MSO_SHAPE.OVAL, cx - r, cy - r, r * 2, r * 2)
    shp.name = "glow-bg"
    set_radial(shp, color, alpha)
    set_line(shp, None)
    return shp


def line(slide, x1, y1, x2, y2, color=WHITE, width=1.0, alpha=None, dash=None,
         tail=False, head=False):
    conn = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, I(x1), I(y1), I(x2), I(y2))
    set_line(conn, color, width, alpha=alpha, dash=dash, tail=tail, head=head)
    return conn


def arrow(slide, x1, y1, x2, y2, color=CYAN, width=1.2, alpha=55, dash=None):
    return line(slide, x1, y1, x2, y2, color=color, width=width,
                alpha=alpha, dash=dash, tail=True)


def _rpr(run, color, size, bold, italic, font, spc, caps):
    f = run.font
    f.name = font
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.color.rgb = _rgb(color)
    rPr = run._r.get_or_add_rPr()
    if spc:
        rPr.set("spc", str(int(spc)))
    if caps:
        rPr.set("cap", "all")


def _hanging(p, indent_in=0.17):
    pPr = p._p.get_or_add_pPr()
    pPr.set("marL", str(int(Inches(indent_in))))
    pPr.set("indent", str(int(-Inches(indent_in))))


def text(slide, x, y, w, h, content, size=11.5, color=WHITE, bold=False,
         italic=False, font=FONT, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         spacing=1.18, space_after=0, spc=0, caps=False, wrap=True):
    box = slide.shapes.add_textbox(I(x), I(y), I(w), I(h))
    tf = box.text_frame
    tf.word_wrap = wrap
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    tf.auto_size = MSO_AUTO_SIZE.NONE
    items = content if isinstance(content, (list, tuple)) else [(content, {})]
    first = True
    for item in items:
        if isinstance(item, str):
            txt, opts = item, {}
        else:
            txt, opts = item[0], (item[1] if len(item) > 1 else {})
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = opts.get("align", align)
        p.line_spacing = opts.get("spacing", spacing)
        p.space_before = Pt(opts.get("space_before", 0))
        p.space_after = Pt(opts.get("space_after", space_after))
        if opts.get("indent"):
            _hanging(p, opts["indent"])
        runs = opts.get("runs")
        if runs is None:
            runs = [(txt, {})]
        for rt, ro in runs:
            r = p.add_run()
            r.text = rt
            _rpr(r, ro.get("color", opts.get("color", color)),
                 ro.get("size", opts.get("size", size)),
                 ro.get("bold", opts.get("bold", bold)),
                 ro.get("italic", opts.get("italic", italic)),
                 ro.get("font", opts.get("font", font)),
                 ro.get("spc", opts.get("spc", spc)),
                 ro.get("caps", opts.get("caps", caps)))
    return box


def block(slide, x, y, w, h, items, size=11.5, color=MUTED, bullet_color=CYAN,
          gap=6, spacing=1.25, bullet="\u25aa"):
    box = slide.shapes.add_textbox(I(x), I(y), I(w), I(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.auto_size = MSO_AUTO_SIZE.NONE
    for idx, item in enumerate(items):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.line_spacing = spacing
        p.space_after = Pt(gap)
        if isinstance(item, dict):
            runs = item.get("runs")
            if runs is None:
                runs = [(item.get("text", ""), {})]
            bullet_on = item.get("bullet", True)
            bcolor = item.get("bullet_color", bullet_color)
            psize = item.get("size", size)
        else:
            runs = [(item, {})]
            bullet_on = True
            bcolor = bullet_color
            psize = size
        if bullet_on:
            _hanging(p, 0.19)
            r = p.add_run()
            r.text = bullet + "   "
            _rpr(r, bcolor, psize * 0.85, True, False, FONT, 0, False)
        for rt, ro in runs:
            r = p.add_run()
            r.text = rt
            _rpr(r, ro.get("color", color), ro.get("size", psize),
                 ro.get("bold", False), ro.get("italic", False),
                 ro.get("font", FONT), ro.get("spc", 0), False)
    return box


# ------------------------------------------------------------- components
def kicker(slide, x, y, label, color=CYAN):
    return text(slide, x, y, 8.6, 0.22, label.upper(), size=9.5, color=color,
                bold=True, spc=220)


def heading(slide, x, y, title, w=11.9, size=27, color=WHITE):
    return text(slide, x, y, w, 0.62, title, size=size, color=color, bold=True,
                spacing=0.95)


def accent_rule(slide, x, y, w=0.62, color=CYAN):
    a = rect(slide, x, y, w, 0.045, fill=color)
    b = rect(slide, x + w + 0.06, y, 0.11, 0.045, fill=color, alpha=45)
    return a, b


def card(slide, x, y, w, h, accent=None, fill=PANEL, alpha=92, radius=0.055,
         line_color=WHITE, line_alpha=9):
    shp = rect(slide, x, y, w, h, fill=fill, alpha=alpha, radius=radius,
               line=line_color, line_w=0.9, line_alpha=line_alpha)
    if accent:
        rect(slide, x, y + 0.18, 0.035, h - 0.36, fill=accent, alpha=85)
    return shp


def chip(slide, x, y, w, h, label, color=CYAN, size=9.5, fill=None, bold=True):
    shp = rect(slide, x, y, w, h, fill=fill or color, alpha=10, radius=0.5,
               line=color, line_w=0.8, line_alpha=32)
    tf = shp.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    _rpr(r, color, size, bold, False, FONT, 30, False)
    return shp


def num_badge(slide, x, y, n, color=CYAN, d=0.32, size=9):
    shp = oval(slide, x, y, d, d, fill=color, alpha=13, line=color, line_w=0.9)
    tf = shp.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = n
    _rpr(r, color, size, True, False, FONT, 0, False)
    return shp


def footer(slide, n, total, label=""):
    y = 6.93
    line(slide, 0.72, y, 12.61, y, color=WHITE, width=0.7, alpha=10)
    text(slide, 0.72, y + 0.12, 8.6, 0.24,
         "Économie du numérique & économie de l\u2019attention  ·  Master SDIA"
         + ("  ·  " + label if label else ""),
         size=7.8, color=DIM, spc=20)
    text(slide, 11.1, y + 0.12, 1.5, 0.24, "%02d / %d" % (n, total), size=7.8,
         color=DIM, align=PP_ALIGN.RIGHT, spc=20)


def background(slide, hero=False, tint=CYAN):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = _rgb(NAVY_0)
    if hero:
        glow(slide, 10.6, 1.3, 3.4, VIOLET, 30)
        glow(slide, 12.1, 5.6, 2.6, CYAN, 22)
        glow(slide, 1.6, 6.4, 2.4, BLUE, 18)
    else:
        glow(slide, 12.3, -0.4, 2.9, tint, 16)
        glow(slide, -0.6, 6.9, 2.4, VIOLET, 13)


# ------------------------------------------------------ native animations
EFFECT_PRESETS = {
    "fade": (10, "entr", 0),
    "appear": (1, "entr", 0),
    "wipe_up": (22, "entr", 4),
    "wipe_down": (22, "entr", 1),
    "wipe_left": (22, "entr", 8),
    "wipe_right": (22, "entr", 2),
    "zoom": (23, "entr", 16),
    "motion": (0, "path", 0),
}


class _Ids:
    def __init__(self, start=3):
        self.n = start

    def __call__(self):
        self.n += 1
        return self.n


def _set_el(cid, spid):
    return (
        '<p:set><p:cBhvr><p:cTn id="%d" dur="1" fill="hold">'
        '<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
        '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl>'
        '<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>'
        '</p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>' % (cid, spid)
    )


def _fade(cid, spid, dur):
    return ('<p:animEffect transition="in" filter="fade"><p:cBhvr>'
            '<p:cTn id="%d" dur="%d"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl>'
            '</p:cBhvr></p:animEffect>' % (cid, dur, spid))


def _wipe(cid, spid, dur, direction):
    return ('<p:animEffect transition="in" filter="wipe(%s)"><p:cBhvr>'
            '<p:cTn id="%d" dur="%d"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl>'
            '</p:cBhvr></p:animEffect>' % (direction, cid, dur, spid))


def _scale(cid, spid, dur):
    return ('<p:animScale><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/>'
            '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr>'
            '<p:from x="68000" y="68000"/><p:to x="100000" y="100000"/></p:animScale>'
            % (cid, dur, spid))


def _motion(cid, spid, dur, path="M 0 0 L 0.86 0"):
    return ('<p:animMotion origin="layout" path="%s" pathEditMode="relative" '
            'rAng="0" ptsTypes=""><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/>'
            '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr></p:animMotion>'
            % (path, cid, dur, spid))


def _payload(kind, ids, spid, dur):
    out = _set_el(ids(), spid)
    if kind == "fade":
        out += _fade(ids(), spid, dur)
    elif kind == "appear":
        pass
    elif kind == "zoom":
        out += _fade(ids(), spid, int(dur * 0.8))
        out += _scale(ids(), spid, dur)
    elif kind.startswith("wipe"):
        direction = {"wipe_up": "up", "wipe_down": "down",
                     "wipe_left": "left", "wipe_right": "right"}[kind]
        out += _wipe(ids(), spid, dur, direction)
    elif kind == "motion":
        out += _fade(ids(), spid, 320)
        out += _motion(ids(), spid, dur)
    return out


def timing_xml(groups):
    ids = _Ids()
    body = []
    for group in groups:
        g1, g2 = ids(), ids()
        effects = []
        for k, spec in enumerate(group):
            shape, kind = spec[0], spec[1]
            delay = spec[2] if len(spec) > 2 else 0
            dur = spec[3] if len(spec) > 3 else 520
            spid = shape.shape_id
            eid = ids()
            node = "clickEffect" if k == 0 else "withEffect"
            pres = EFFECT_PRESETS.get(kind, EFFECT_PRESETS["fade"])
            effects.append(
                '<p:par><p:cTn id="%d" presetID="%d" presetClass="%s" '
                'presetSubtype="%d" fill="hold" grpId="0" nodeType="%s">'
                '<p:stCondLst><p:cond delay="%d"/></p:stCondLst>'
                '<p:childTnLst>%s</p:childTnLst>'
                '</p:cTn></p:par>'
                % (eid, pres[0], pres[1], pres[2], node, delay,
                   _payload(kind, ids, spid, dur))
            )
        body.append(
            '<p:par><p:cTn id="%d" fill="hold">'
            '<p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
            '<p:childTnLst><p:par><p:cTn id="%d" fill="hold">'
            '<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
            '<p:childTnLst>%s</p:childTnLst></p:cTn></p:par>'
            '</p:childTnLst></p:cTn></p:par>'
            % (g1, g2, "".join(effects))
        )
    return (
        '<p:timing %s><p:tnLst><p:par>'
        '<p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">'
        '<p:childTnLst><p:seq concurrent="1" nextAc="seek">'
        '<p:cTn id="2" dur="indefinite" nodeType="mainSeq">'
        '<p:childTnLst>%s</p:childTnLst></p:cTn>'
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
        '</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'
        % (nsdecls("p"), "".join(body))
    )


P_NS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'


def transition_xml(kind="fade", speed="med"):
    if kind == "morph":
        return (
            '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
            '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
            '<p:transition %s spd="slow"><p159:morph option="byObject"/></p:transition>'
            '</mc:Choice><mc:Fallback>'
            '<p:transition %s spd="slow"><p:fade/></p:transition>'
            '</mc:Fallback></mc:AlternateContent>' % (P_NS, P_NS)
        )
    return '<p:transition %s spd="%s"><p:%s/></p:transition>' % (P_NS, speed, kind)


def apply_timing(slide, groups, transition="fade", speed="med"):
    el = slide.element
    for tag in ("p:transition", "p:timing"):
        for ex in el.findall(qn(tag)):
            el.remove(ex)
    ext = el.find(qn("p:extLst"))
    tr = parse_xml(transition_xml(transition, speed))
    if ext is not None:
        ext.addprevious(tr)
    else:
        el.append(tr)
    if groups:
        tm = parse_xml(timing_xml(groups))
        if ext is not None:
            ext.addprevious(tm)
        else:
            el.append(tm)


def notes(slide, body):
    slide.notes_slide.notes_text_frame.text = body
