#!/usr/bin/env python3
"""
Bites-N-Wheels user workflow diagram.

    workflow.svg   vector, for PowerPoint
    workflow.png   raster fallback, ~4800px wide

Same discipline as er-diagram-gen.py: connectors are explicit waypoint
lists, so every segment is horizontal or vertical and nothing curves.

The content mirrors what the application actually does today - the truck
owner publishes a journey of stops, and the customer picks an area first
and only ever sees trucks whose journey reaches that area.

    python workflow-gen.py
"""

import math

# ----------------------------------------------------------------- canvas
CANVAS_W, CANVAS_H = 1850, 1080
PNG_SCALE = 2.6

BOX_W, BOX_H = 660, 66
PITCH        = 86
STEP_TOP     = 330

CUST_X, VEND_X = 110, 1080
CUST_MID = CUST_X + BOX_W // 2
VEND_MID = VEND_X + BOX_W // 2
MID_X    = CANVAS_W // 2

# ------------------------------------------------------------------ style
BRAND    = '#e4502a'      # from the logo
BRAND_DK = '#b83c1c'
NAVY     = '#12303f'
INK      = '#16202b'
MUTED    = '#5c6b7a'
LINE     = '#41566b'
BOX_BG   = '#ffffff'
BOX_EDGE = '#c9d3db'
TINT     = '#fdeee9'
TEAL     = '#0b6b78'

TITLE    = 'Bites-N-Wheels — User Workflow'
SUBTITLE = ('One login, two roles. The truck owner publishes a journey; '
            'the customer picks an area and sees only what is coming to it.')
FOOTER   = ('A truck appears to a customer only if today’s journey includes '
            'that customer’s area  ·  one order always comes from one truck')

CUSTOMER = [
    'Choose your area  (e.g. Tambaram)',
    'See food arriving in that area today',
    'Filter by category, veg, or search',
    'Tap a dish to see who is bringing it',
    'Compare price, arrival time, stock',
    'Add to cart  —  one truck per order',
    'Checkout  —  cash on delivery, now or pre-order',
    'Track the order until it is handed over',
]

OWNER = [
    'Set up truck profile, tagline, cuisine',
    'Add menu items with price and stock',
    'Plan today’s journey  —  pick the stops',
    'Set arrival and departure per stop',
    'Publish journey  —  now visible to customers',
    'Accept or reject incoming orders',
    'Preparing  →  Ready  →  Handed over',
    'Walk-in billing and demand insights',
]


def step_y(i):
    return STEP_TOP + i * PITCH


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


# ---------------------------------------------------------------- routing
def connectors():
    """Vertical links down each lane plus the two hand-offs between them."""
    out = []
    for i in range(len(CUSTOMER) - 1):
        y = step_y(i) + BOX_H
        out.append({'pts': [(CUST_MID, y), (CUST_MID, step_y(i + 1))], 'label': None})
    for i in range(len(OWNER) - 1):
        y = step_y(i) + BOX_H
        out.append({'pts': [(VEND_MID, y), (VEND_MID, step_y(i + 1))], 'label': None})

    # customer checkout (7) -> owner order queue (6)
    out.append({'pts': [(CUST_X + BOX_W, step_y(6) + BOX_H // 2),
                        (925, step_y(6) + BOX_H // 2),
                        (925, step_y(5) + BOX_H // 2),
                        (VEND_X, step_y(5) + BOX_H // 2)],
                'label': 'order placed', 'accent': True})

    # owner status (7) -> customer tracking (8)
    out.append({'pts': [(VEND_X, step_y(6) + BOX_H // 2),
                        (955, step_y(6) + BOX_H // 2),
                        (955, step_y(7) + BOX_H // 2),
                        (CUST_X + BOX_W, step_y(7) + BOX_H // 2)],
                'label': 'live status', 'accent': True})
    return out


def splitter():
    """Login pill fanning out to the two lane headings."""
    return [
        [(MID_X, 214), (MID_X, 246)],
        [(CUST_MID, 246), (VEND_MID, 246)],
        [(CUST_MID, 246), (CUST_MID, 272)],
        [(VEND_MID, 246), (VEND_MID, 272)],
    ]


# -------------------------------------------------------------------- SVG
def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def build_svg():
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" '
         f'width="{CANVAS_W}" height="{CANVAS_H}" '
         f'font-family="Segoe UI,Calibri,Arial,sans-serif">',
         f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#ffffff"/>',
         '<defs>'
         f'<marker id="ar" markerWidth="11" markerHeight="9" refX="10" refY="4.5" '
         f'orient="auto"><path d="M0,0 L11,4.5 L0,9 Z" fill="{LINE}"/></marker>'
         f'<marker id="arb" markerWidth="11" markerHeight="9" refX="10" refY="4.5" '
         f'orient="auto"><path d="M0,0 L11,4.5 L0,9 Z" fill="{BRAND}"/></marker>'
         '</defs>']

    # heading
    o.append(f'<text x="70" y="66" font-size="36" font-weight="700" fill="{NAVY}">{esc(TITLE)}</text>')
    o.append(f'<text x="70" y="102" font-size="19" fill="{MUTED}">{esc(SUBTITLE)}</text>')
    o.append(f'<rect x="70" y="118" width="{CANVAS_W - 140}" height="3" fill="{BRAND}"/>')

    # login pill
    pw = 380
    o.append(f'<rect x="{MID_X - pw // 2}" y="150" width="{pw}" height="64" rx="32" fill="{BRAND}"/>')
    o.append(f'<text x="{MID_X}" y="190" text-anchor="middle" font-size="23" '
             f'font-weight="700" fill="#ffffff" letter-spacing="0.8">REGISTER  /  LOGIN</text>')

    for seg in splitter():
        d = 'M' + ' L'.join(f'{x},{y}' for x, y in seg)
        o.append(f'<path d="{d}" fill="none" stroke="{BRAND}" stroke-width="2.6"/>')

    # lane headings
    for mid, text in ((CUST_MID, 'CUSTOMER'), (VEND_MID, 'TRUCK OWNER')):
        o.append(f'<text x="{mid}" y="298" text-anchor="middle" font-size="25" '
                 f'font-weight="700" fill="{NAVY}" letter-spacing="1.2">{text}</text>')
        o.append(f'<rect x="{mid - 90}" y="308" width="180" height="3" fill="{BRAND}"/>')

    # connectors
    for c in connectors():
        pts = c['pts']
        d = 'M' + ' L'.join(f'{x},{y}' for x, y in pts)
        col = BRAND if c.get('accent') else LINE
        mk = 'arb' if c.get('accent') else 'ar'
        o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.6" '
                 f'marker-end="url(#{mk})"/>')
        if c['label']:
            runs = [(i, abs(pts[i + 1][1] - pts[i][1]))
                    for i in range(len(pts) - 1) if pts[i][0] == pts[i + 1][0]]
            i, _ln = max(runs, key=lambda t: t[1])
            cx = pts[i][0]
            cy = (pts[i][1] + pts[i + 1][1]) / 2
            w = len(c['label']) * 9.6 + 22
            o.append(f'<rect x="{cx - w/2:.0f}" y="{cy - 14:.0f}" width="{w:.0f}" height="28" '
                     f'rx="14" fill="{TINT}"/>')
            o.append(f'<text x="{cx:.0f}" y="{cy + 6:.0f}" text-anchor="middle" font-size="17" '
                     f'font-weight="700" fill="{BRAND_DK}">{esc(c["label"])}</text>')

    # step boxes
    for lane_x, steps in ((CUST_X, CUSTOMER), (VEND_X, OWNER)):
        for i, text in enumerate(steps):
            y = step_y(i)
            o.append(f'<rect x="{lane_x}" y="{y}" width="{BOX_W}" height="{BOX_H}" rx="10" '
                     f'fill="{BOX_BG}" stroke="{BOX_EDGE}" stroke-width="2"/>')
            o.append(f'<path d="M{lane_x + 2},{y + 10} a8,8 0 0 1 8,-8 l6,0 l0,{BOX_H - 4} l-6,0 '
                     f'a8,8 0 0 1 -8,-8 Z" fill="{BRAND}"/>')
            o.append(f'<circle cx="{lane_x + 58}" cy="{y + BOX_H // 2}" r="21" fill="{TINT}"/>')
            o.append(f'<text x="{lane_x + 58}" y="{y + BOX_H // 2 + 8}" text-anchor="middle" '
                     f'font-size="21" font-weight="700" fill="{BRAND_DK}">{i + 1}</text>')
            o.append(f'<text x="{lane_x + 96}" y="{y + BOX_H // 2 + 8}" font-size="20" '
                     f'fill="{INK}">{esc(text)}</text>')

    o.append(f'<rect x="70" y="{CANVAS_H - 62}" width="{CANVAS_W - 140}" height="2" fill="{BOX_EDGE}"/>')
    o.append(f'<text x="{MID_X}" y="{CANVAS_H - 28}" text-anchor="middle" font-size="18" '
             f'fill="{TEAL}" font-weight="600">{esc(FOOTER)}</text>')
    o.append('</svg>')
    return '\n'.join(o)


# -------------------------------------------------------------------- PNG
def render_png(path, scale=PNG_SCALE):
    import cairo
    W, H = int(CANVAS_W * scale), int(CANVAS_H * scale)
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    c = cairo.Context(surf)
    c.scale(scale, scale)
    c.set_source_rgb(1, 1, 1); c.paint()

    def font(sz, bold=False):
        c.select_font_face('Segoe UI', cairo.FONT_SLANT_NORMAL,
                           cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
        c.set_font_size(sz)

    def rounded(x, y, w, h, r):
        c.new_sub_path()
        c.arc(x + w - r, y + r, r, -math.pi / 2, 0)
        c.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
        c.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
        c.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
        c.close_path()

    def centre(text, cx, y):
        e = c.text_extents(text)
        c.move_to(cx - e.width / 2 - e.x_bearing, y)
        c.show_text(text)

    def arrow(p, q, col):
        """Filled triangle at q, pointing along p->q."""
        c.set_source_rgb(*hexrgb(col))
        dx, dy = q[0] - p[0], q[1] - p[1]
        n = math.hypot(dx, dy) or 1
        ux, uy = dx / n, dy / n
        px, py = -uy, ux
        tipx, tipy = q
        bx, by = tipx - ux * 11, tipy - uy * 11
        c.move_to(tipx, tipy)
        c.line_to(bx + px * 4.5, by + py * 4.5)
        c.line_to(bx - px * 4.5, by - py * 4.5)
        c.close_path(); c.fill()

    # heading
    font(36, True); c.set_source_rgb(*hexrgb(NAVY)); c.move_to(70, 66); c.show_text(TITLE)
    font(19);       c.set_source_rgb(*hexrgb(MUTED)); c.move_to(70, 102); c.show_text(SUBTITLE)
    c.set_source_rgb(*hexrgb(BRAND)); c.rectangle(70, 118, CANVAS_W - 140, 3); c.fill()

    # login pill
    pw = 380
    c.set_source_rgb(*hexrgb(BRAND)); rounded(MID_X - pw // 2, 150, pw, 64, 32); c.fill()
    font(23, True); c.set_source_rgb(1, 1, 1); centre('REGISTER  /  LOGIN', MID_X, 190)

    c.set_source_rgb(*hexrgb(BRAND)); c.set_line_width(2.6)
    for seg in splitter():
        c.move_to(*seg[0])
        for p in seg[1:]:
            c.line_to(*p)
        c.stroke()

    # lane headings
    for mid, text in ((CUST_MID, 'CUSTOMER'), (VEND_MID, 'TRUCK OWNER')):
        font(25, True); c.set_source_rgb(*hexrgb(NAVY)); centre(text, mid, 298)
        c.set_source_rgb(*hexrgb(BRAND)); c.rectangle(mid - 90, 308, 180, 3); c.fill()

    # connectors
    for con in connectors():
        pts = con['pts']
        col = BRAND if con.get('accent') else LINE
        c.set_source_rgb(*hexrgb(col)); c.set_line_width(2.6)
        c.move_to(*pts[0])
        for p in pts[1:]:
            c.line_to(*p)
        c.stroke()
        arrow(pts[-2], pts[-1], col)
        if con['label']:
            runs = [(i, abs(pts[i + 1][1] - pts[i][1]))
                    for i in range(len(pts) - 1) if pts[i][0] == pts[i + 1][0]]
            i, _ = max(runs, key=lambda t: t[1])
            cx = pts[i][0]; cy = (pts[i][1] + pts[i + 1][1]) / 2
            w = len(con['label']) * 9.6 + 22
            c.set_source_rgb(*hexrgb(TINT)); rounded(cx - w / 2, cy - 14, w, 28, 14); c.fill()
            font(17, True); c.set_source_rgb(*hexrgb(BRAND_DK)); centre(con['label'], cx, cy + 6)

    # step boxes
    for lane_x, steps in ((CUST_X, CUSTOMER), (VEND_X, OWNER)):
        for i, text in enumerate(steps):
            y = step_y(i)
            c.set_source_rgb(*hexrgb(BOX_BG)); rounded(lane_x, y, BOX_W, BOX_H, 10); c.fill()
            c.set_source_rgb(*hexrgb(BOX_EDGE)); c.set_line_width(2)
            rounded(lane_x, y, BOX_W, BOX_H, 10); c.stroke()
            c.set_source_rgb(*hexrgb(BRAND))
            c.rectangle(lane_x + 2, y + 8, 8, BOX_H - 16); c.fill()
            c.set_source_rgb(*hexrgb(TINT))
            c.arc(lane_x + 58, y + BOX_H / 2, 21, 0, 2 * math.pi); c.fill()
            font(21, True); c.set_source_rgb(*hexrgb(BRAND_DK))
            centre(str(i + 1), lane_x + 58, y + BOX_H / 2 + 8)
            font(20); c.set_source_rgb(*hexrgb(INK))
            c.move_to(lane_x + 96, y + BOX_H / 2 + 8); c.show_text(text)

    c.set_source_rgb(*hexrgb(BOX_EDGE)); c.rectangle(70, CANVAS_H - 62, CANVAS_W - 140, 2); c.fill()
    font(18, True); c.set_source_rgb(*hexrgb(TEAL)); centre(FOOTER, MID_X, CANVAS_H - 28)

    surf.write_to_png(path)
    return W, H


if __name__ == '__main__':
    import pathlib
    here = pathlib.Path(__file__).parent
    (here / 'workflow.svg').write_text(build_svg(), encoding='utf-8')
    print('wrote workflow.svg')
    try:
        w, h = render_png(str(here / 'workflow.png'))
        print(f'wrote workflow.png  ({w}x{h})')
    except Exception as exc:
        print(f'PNG skipped: {type(exc).__name__}: {exc}')
