#!/usr/bin/env python3
"""
Bites-N-Wheels ER diagram generator.

Emits the same diagram twice, from one model:
    er-diagram.svg   vector, for PowerPoint (Insert > Pictures)
    er-diagram.png   raster fallback, ~4800px wide

Every connector is an explicit list of waypoints; consecutive points always
share an x or a y, so no segment can be diagonal and nothing is auto-routed.
Vertical runs use per-edge channel x-values, and labels are placed by a
collision pass that refuses to sit on a table box or on another label.

    python er-diagram-gen.py
"""

import math

# ----------------------------------------------------------------- layout
CARD_W   = 300
HEADER_H = 40
ROW_H    = 24
PAD_B    = 10

C1, C2, C3, C4 = 80, 550, 1020, 1490
CANVAS_W, CANVAS_H = 1850, 1030

PNG_SCALE = 2.6          # 1850 * 2.6 = 4810px wide

# ----------------------------------------------------------------- schema
# Mirrors docs/schema.sql exactly: 11 tables, 16 foreign keys.
TABLES = {
    'USERS': (C1, 60, [
        ('PK', 'user_id'), ('', 'name'), ('UK', 'email'), ('UK', 'phone'),
        ('', 'password_hash'), ('', 'role'), ('', 'status'), ('', 'created_at'),
    ]),
    'STATION': (C1, 420, [
        ('PK', 'station_id'), ('', 'name'), ('', 'latitude'), ('', 'longitude'),
    ]),
    'DEMAND_INSIGHT': (C1, 620, [
        ('PK', 'insight_id'), ('FK', 'truck_id'), ('FK', 'station_id'),
        ('', 'period_start'), ('', 'period_end'), ('', 'metric'),
        ('', 'suggestion'), ('', 'created_at'),
    ]),
    'TRUCK': (C2, 60, [
        ('PK', 'truck_id'), ('FK', 'owner_id'), ('', 'name'),
        ('', 'tagline'), ('', 'status'), ('', 'created_at'),
    ]),
    'TRUCK_SCHEDULE': (C2, 360, [
        ('PK', 'schedule_id'), ('FK', 'truck_id'), ('FK', 'station_id'),
        ('', 'service_date'), ('', 'arrival_time'), ('', 'departure_time'),
        ('', 'status'),
    ]),
    'ORDERS': (C2, 640, [
        ('PK', 'order_id'), ('FK', 'user_id'), ('FK', 'truck_id'),
        ('FK', 'schedule_id'), ('', 'order_type'), ('', 'status'),
        ('', 'scheduled_time'), ('', 'total_amount'), ('', 'reject_reason'),
        ('', 'created_at'),
    ]),
    'MENU': (C3, 50, [
        ('PK', 'menu_id'), ('FK', 'truck_id'), ('', 'menu_date'), ('', 'status'),
    ]),
    'MENU_ITEM': (C3, 240, [
        ('PK', 'item_id'), ('FK', 'truck_id'), ('', 'name'), ('', 'description'),
        ('', 'price'), ('', 'category_tag'), ('', 'food_type'), ('', 'available'),
        ('', 'stock_quantity'), ('', 'available_from'), ('', 'created_at'),
    ]),
    'NOTIFICATION': (C3, 620, [
        ('PK', 'notification_id'), ('FK', 'user_id'), ('FK', 'order_id'),
        ('', 'message'), ('', 'is_read'), ('', 'created_at'),
    ]),
    'MENU_SELECTION': (C4, 70, [
        ('PF', 'menu_id'), ('PF', 'item_id'),
    ]),
    'ORDER_ITEM': (C4, 560, [
        ('PK', 'order_item_id'), ('FK', 'order_id'), ('FK', 'item_id'),
        ('', 'quantity'), ('', 'price_at_order'),
    ]),
}


def card_h(n):
    return HEADER_H + len(TABLES[n][2]) * ROW_H + PAD_B


def row_y(n, i):
    return TABLES[n][1] + HEADER_H + i * ROW_H + ROW_H // 2


def left(n):
    return TABLES[n][0]


def right(n):
    return TABLES[n][0] + CARD_W


def card_rects():
    return [(x, y, x + CARD_W, y + card_h(n)) for n, (x, y, _c) in TABLES.items()]


# ------------------------------------------------------------------ edges
def E(label, pts):
    return {'label': label, 'pts': pts}


def build_edges():
    e = []
    e.append(E('owns', [                                       # truck -> users
        (right('USERS'), row_y('USERS', 0)), (460, row_y('USERS', 0)),
        (460, row_y('TRUCK', 1)), (left('TRUCK'), row_y('TRUCK', 1))]))

    e.append(E('publishes', [                                  # menu -> truck
        (right('TRUCK'), row_y('TRUCK', 0)), (880, row_y('TRUCK', 0)),
        (880, row_y('MENU', 1)), (left('MENU'), row_y('MENU', 1))]))

    e.append(E('catalogues', [                                 # menu_item -> truck
        (right('TRUCK'), row_y('TRUCK', 0)), (910, row_y('TRUCK', 0)),
        (910, row_y('MENU_ITEM', 1)), (left('MENU_ITEM'), row_y('MENU_ITEM', 1))]))

    e.append(E('lists', [                                      # menu_selection -> menu
        (right('MENU'), row_y('MENU', 0)), (1350, row_y('MENU', 0)),
        (1350, row_y('MENU_SELECTION', 0)),
        (left('MENU_SELECTION'), row_y('MENU_SELECTION', 0))]))

    e.append(E('selects', [                                    # menu_selection -> menu_item
        (right('MENU_ITEM'), row_y('MENU_ITEM', 0)), (1380, row_y('MENU_ITEM', 0)),
        (1380, row_y('MENU_SELECTION', 1)),
        (left('MENU_SELECTION'), row_y('MENU_SELECTION', 1))]))

    e.append(E('schedules', [                                  # truck_schedule -> truck
        (left('TRUCK'), row_y('TRUCK', 0)), (500, row_y('TRUCK', 0)),
        (500, row_y('TRUCK_SCHEDULE', 1)),
        (left('TRUCK_SCHEDULE'), row_y('TRUCK_SCHEDULE', 1))]))

    e.append(E('hosts', [                                      # truck_schedule -> station
        (right('STATION'), row_y('STATION', 0)), (480, row_y('STATION', 0)),
        (480, row_y('TRUCK_SCHEDULE', 2)),
        (left('TRUCK_SCHEDULE'), row_y('TRUCK_SCHEDULE', 2))]))

    e.append(E('places', [                                     # orders -> users
        (right('USERS'), row_y('USERS', 0)), (440, row_y('USERS', 0)),
        (440, row_y('ORDERS', 1)), (left('ORDERS'), row_y('ORDERS', 1))]))

    e.append(E('fulfils', [                                    # orders -> truck
        (right('TRUCK'), row_y('TRUCK', 0)), (940, row_y('TRUCK', 0)),
        (940, row_y('ORDERS', 2)), (right('ORDERS'), row_y('ORDERS', 2))]))

    e.append(E('serves', [                                     # orders -> truck_schedule
        (right('TRUCK_SCHEDULE'), row_y('TRUCK_SCHEDULE', 0)),
        (970, row_y('TRUCK_SCHEDULE', 0)),
        (970, row_y('ORDERS', 3)), (right('ORDERS'), row_y('ORDERS', 3))]))

    e.append(E('contains', [                                   # order_item -> orders
        (right('ORDERS'), row_y('ORDERS', 0)), (1000, row_y('ORDERS', 0)),
        (1000, 597), (1440, 597),
        (1440, row_y('ORDER_ITEM', 1)), (left('ORDER_ITEM'), row_y('ORDER_ITEM', 1))]))

    e.append(E('ordered as', [                                 # order_item -> menu_item
        (right('MENU_ITEM'), row_y('MENU_ITEM', 0)), (1410, row_y('MENU_ITEM', 0)),
        (1410, row_y('ORDER_ITEM', 2)), (left('ORDER_ITEM'), row_y('ORDER_ITEM', 2))]))

    e.append(E('receives', [                                   # notification -> users
        (left('USERS'), row_y('USERS', 0)), (40, row_y('USERS', 0)),
        (40, 960), (985, 960),
        (985, row_y('NOTIFICATION', 1)),
        (left('NOTIFICATION'), row_y('NOTIFICATION', 1))]))

    e.append(E('triggers', [                                   # notification -> orders
        (right('ORDERS'), row_y('ORDERS', 0)), (880, row_y('ORDERS', 0)),
        (880, row_y('NOTIFICATION', 2)),
        (left('NOTIFICATION'), row_y('NOTIFICATION', 2))]))

    e.append(E('informs', [                                    # demand_insight -> truck
        (left('TRUCK'), row_y('TRUCK', 0)), (530, row_y('TRUCK', 0)),
        (530, row_y('DEMAND_INSIGHT', 1)),
        (right('DEMAND_INSIGHT'), row_y('DEMAND_INSIGHT', 1))]))

    e.append(E('scopes', [                                     # demand_insight -> station
        (right('STATION'), row_y('STATION', 0)), (400, row_y('STATION', 0)),
        (400, row_y('DEMAND_INSIGHT', 2)),
        (right('DEMAND_INSIGHT'), row_y('DEMAND_INSIGHT', 2))]))
    return e


# --------------------------------------------------------- label placement
LABEL_H = 26


def label_w(text):
    return len(text) * 9.2 + 20


def place_labels():
    """Pick a spot for each relationship name that is not on a table box and
    not on another label. Shared by both renderers so SVG and PNG match."""
    boxes = card_rects()
    placed, out = [], []

    def clash(a, b):
        return a[0] < b[2] and a[2] > b[0] and a[1] < b[3] and a[3] > b[1]

    for edge in build_edges():
        pts, text = edge['pts'], edge['label']
        w, h = label_w(text), LABEL_H
        spot = None

        h_runs = sorted(((i, abs(pts[i + 1][0] - pts[i][0]))
                         for i in range(len(pts) - 1)
                         if pts[i][1] == pts[i + 1][1]), key=lambda t: -t[1])
        v_runs = sorted(((i, abs(pts[i + 1][1] - pts[i][1]))
                         for i in range(len(pts) - 1)
                         if pts[i][0] == pts[i + 1][0]), key=lambda t: -t[1])

        for i, ln in h_runs:
            if ln < w + 12:
                continue
            x1, x2 = sorted((pts[i][0], pts[i + 1][0]))
            y = pts[i][1]
            for f in (0.5, 0.64, 0.36, 0.78, 0.22):
                cx = x1 + (x2 - x1) * f
                if cx - w / 2 < x1 + 4 or cx + w / 2 > x2 - 4:
                    continue
                r = (cx - w / 2, y - h / 2, cx + w / 2, y + h / 2)
                if any(clash(r, b) for b in boxes) or any(clash(r, q) for q in placed):
                    continue
                placed.append(r); spot = (cx, y); break
            if spot:
                break

        if not spot:
            for i, ln in v_runs:
                if ln < h + 30:
                    continue
                y1, y2 = sorted((pts[i][1], pts[i + 1][1]))
                cx = pts[i][0]
                for f in (0.5, 0.66, 0.34, 0.8, 0.2):
                    cy = y1 + (y2 - y1) * f
                    if cy - h / 2 < y1 + 6 or cy + h / 2 > y2 - 6:
                        continue
                    r = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
                    if any(clash(r, b) for b in boxes) or any(clash(r, q) for q in placed):
                        continue
                    placed.append(r); spot = (cx, cy); break
                if spot:
                    break

        if spot:
            out.append((text, spot[0], spot[1], w))
    return out


# ------------------------------------------------------------------ style
INK      = '#16202b'
LINE     = '#41566b'
HEAD_BG  = '#12303f'
CARD_BG  = '#ffffff'
BORDER   = '#41566b'
KEY_TX   = '#0b6b78'
ROW_ALT  = '#f2f6f8'
FOOT_TX  = '#5c6b7a'
LW       = 2.2

FOOTER = ('Bites-N-Wheels  -  Entity Relationship Diagram  -  '
          '11 entities, 16 relationships')


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def direction(p, q):
    dx, dy = q[0] - p[0], q[1] - p[1]
    return (0 if dx == 0 else (1 if dx > 0 else -1),
            0 if dy == 0 else (1 if dy > 0 else -1))


# -------------------------------------------------------------------- SVG
def build_svg():
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" '
         f'width="{CANVAS_W}" height="{CANVAS_H}" '
         f'font-family="Segoe UI,Calibri,Arial,sans-serif">',
         f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#ffffff"/>']

    for edge in build_edges():
        pts = edge['pts']
        d = 'M' + ' L'.join(f'{x},{y}' for x, y in pts)
        o.append(f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="{LW}" '
                 f'stroke-linejoin="miter"/>')

        sx, sy = pts[0]
        sdx, sdy = direction(pts[1], pts[0])
        if sdx:
            o.append(f'<line x1="{sx - 11 * sdx}" y1="{sy - 9}" x2="{sx - 11 * sdx}" '
                     f'y2="{sy + 9}" stroke="{LINE}" stroke-width="{LW}" stroke-linecap="round"/>')
        else:
            o.append(f'<line x1="{sx - 9}" y1="{sy - 11 * sdy}" x2="{sx + 9}" '
                     f'y2="{sy - 11 * sdy}" stroke="{LINE}" stroke-width="{LW}" stroke-linecap="round"/>')

        ex, ey = pts[-1]
        edx, edy = direction(pts[-2], pts[-1])
        if edx:
            b = ex - 13 * edx
            o.append(f'<path d="M{ex},{ey} L{b},{ey - 9} M{ex},{ey} L{b},{ey} '
                     f'M{ex},{ey} L{b},{ey + 9}" fill="none" stroke="{LINE}" '
                     f'stroke-width="{LW}" stroke-linecap="round"/>')
        else:
            b = ey - 13 * edy
            o.append(f'<path d="M{ex},{ey} L{ex - 9},{b} M{ex},{ey} L{ex},{b} '
                     f'M{ex},{ey} L{ex + 9},{b}" fill="none" stroke="{LINE}" '
                     f'stroke-width="{LW}" stroke-linecap="round"/>')

    for text, cx, cy, w in place_labels():
        o.append(f'<rect x="{cx - w/2:.0f}" y="{cy - 13:.0f}" width="{w:.0f}" height="26" '
                 f'rx="4" fill="#ffffff"/>')
        o.append(f'<text x="{cx:.0f}" y="{cy + 6:.0f}" text-anchor="middle" font-size="17" '
                 f'font-weight="600" fill="{KEY_TX}">{text}</text>')

    for name, (x, y, cols) in TABLES.items():
        h = card_h(name)
        o.append(f'<rect x="{x}" y="{y}" width="{CARD_W}" height="{h}" rx="6" '
                 f'fill="{CARD_BG}" stroke="{BORDER}" stroke-width="2.4"/>')
        o.append(f'<path d="M{x + 3},{y + 3} h{CARD_W - 6} v{HEADER_H - 6} h-{CARD_W - 6} Z" '
                 f'fill="{HEAD_BG}"/>')
        o.append(f'<path d="M{x},{y + HEADER_H} L{x + CARD_W},{y + HEADER_H}" '
                 f'stroke="{BORDER}" stroke-width="2.4"/>')
        o.append(f'<text x="{x + CARD_W // 2}" y="{y + 28}" text-anchor="middle" '
                 f'font-size="21" font-weight="700" fill="#ffffff" letter-spacing="0.6">{name}</text>')
        for i, (flag, col) in enumerate(cols):
            ry = y + HEADER_H + i * ROW_H
            if i % 2:
                o.append(f'<rect x="{x + 2}" y="{ry}" width="{CARD_W - 4}" height="{ROW_H}" '
                         f'fill="{ROW_ALT}"/>')
            if flag:
                o.append(f'<text x="{x + 14}" y="{ry + 17}" font-size="15" font-weight="700" '
                         f'fill="{KEY_TX}">{flag}</text>')
            bold = flag in ('PK', 'PF')
            deco = ' text-decoration="underline"' if bold else ''
            o.append(f'<text x="{x + 62}" y="{ry + 17}" font-size="17" '
                     f'font-weight="{"700" if bold else "400"}" fill="{INK}"{deco}>{col}</text>')

    o.append(f'<text x="{CANVAS_W // 2}" y="{CANVAS_H - 18}" text-anchor="middle" '
             f'font-size="17" fill="{FOOT_TX}">{FOOTER}</text>')
    o.append('</svg>')
    return '\n'.join(o)


# -------------------------------------------------------------------- PNG
def render_png(path, scale=PNG_SCALE):
    """Drawn directly with pycairo from the same model - no SVG parsing, so
    the PNG cannot drift from the SVG."""
    import cairo

    W, H = int(CANVAS_W * scale), int(CANVAS_H * scale)
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    c = cairo.Context(surf)
    c.scale(scale, scale)
    c.set_source_rgb(1, 1, 1)
    c.paint()
    c.set_line_join(cairo.LINE_JOIN_MITER)

    def font(size, bold=False):
        c.select_font_face('Segoe UI',
                           cairo.FONT_SLANT_NORMAL,
                           cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
        c.set_font_size(size)

    def rounded(x, y, w, h, r):
        c.new_sub_path()
        c.arc(x + w - r, y + r, r, -math.pi / 2, 0)
        c.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
        c.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
        c.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
        c.close_path()

    # connectors
    c.set_source_rgb(*hexrgb(LINE))
    c.set_line_width(LW)
    for edge in build_edges():
        pts = edge['pts']
        c.move_to(*pts[0])
        for p in pts[1:]:
            c.line_to(*p)
        c.stroke()

        c.set_line_cap(cairo.LINE_CAP_ROUND)
        sx, sy = pts[0]
        sdx, sdy = direction(pts[1], pts[0])
        if sdx:
            c.move_to(sx - 11 * sdx, sy - 9); c.line_to(sx - 11 * sdx, sy + 9)
        else:
            c.move_to(sx - 9, sy - 11 * sdy); c.line_to(sx + 9, sy - 11 * sdy)
        c.stroke()

        ex, ey = pts[-1]
        edx, edy = direction(pts[-2], pts[-1])
        if edx:
            b = ex - 13 * edx
            for dy in (-9, 0, 9):
                c.move_to(ex, ey); c.line_to(b, ey + dy)
        else:
            b = ey - 13 * edy
            for dx in (-9, 0, 9):
                c.move_to(ex, ey); c.line_to(ex + dx, b)
        c.stroke()
        c.set_line_cap(cairo.LINE_CAP_BUTT)

    # relationship labels
    for text, cx, cy, w in place_labels():
        c.set_source_rgb(1, 1, 1)
        rounded(cx - w / 2, cy - 13, w, 26, 4)
        c.fill()
        font(17, True)
        c.set_source_rgb(*hexrgb(KEY_TX))
        ext = c.text_extents(text)
        c.move_to(cx - ext.width / 2 - ext.x_bearing, cy + 6)
        c.show_text(text)

    # tables
    for name, (x, y, cols) in TABLES.items():
        h = card_h(name)
        c.set_source_rgb(*hexrgb(CARD_BG)); rounded(x, y, CARD_W, h, 6); c.fill()

        for i in range(len(cols)):
            if i % 2:
                c.set_source_rgb(*hexrgb(ROW_ALT))
                c.rectangle(x + 2, y + HEADER_H + i * ROW_H, CARD_W - 4, ROW_H)
                c.fill()

        c.set_source_rgb(*hexrgb(HEAD_BG))
        c.rectangle(x + 3, y + 3, CARD_W - 6, HEADER_H - 6); c.fill()

        c.set_source_rgb(*hexrgb(BORDER)); c.set_line_width(2.4)
        rounded(x, y, CARD_W, h, 6); c.stroke()
        c.move_to(x, y + HEADER_H); c.line_to(x + CARD_W, y + HEADER_H); c.stroke()

        font(21, True)
        c.set_source_rgb(1, 1, 1)
        ext = c.text_extents(name)
        c.move_to(x + CARD_W / 2 - ext.width / 2 - ext.x_bearing, y + 28)
        c.show_text(name)

        for i, (flag, col) in enumerate(cols):
            ry = y + HEADER_H + i * ROW_H
            if flag:
                font(15, True)
                c.set_source_rgb(*hexrgb(KEY_TX))
                c.move_to(x + 14, ry + 17); c.show_text(flag)
            bold = flag in ('PK', 'PF')
            font(17, bold)
            c.set_source_rgb(*hexrgb(INK))
            c.move_to(x + 62, ry + 17); c.show_text(col)
            if bold:
                e2 = c.text_extents(col)
                c.set_line_width(1.4)
                c.move_to(x + 62, ry + 21)
                c.line_to(x + 62 + e2.x_advance, ry + 21)
                c.stroke()

    font(17)
    c.set_source_rgb(*hexrgb(FOOT_TX))
    ext = c.text_extents(FOOTER)
    c.move_to(CANVAS_W / 2 - ext.width / 2 - ext.x_bearing, CANVAS_H - 18)
    c.show_text(FOOTER)

    surf.write_to_png(path)
    return W, H


if __name__ == '__main__':
    import pathlib
    here = pathlib.Path(__file__).parent
    svg = here / 'er-diagram.svg'
    svg.write_text(build_svg(), encoding='utf-8')
    print(f'wrote {svg.name}')
    try:
        w, h = render_png(str(here / 'er-diagram.png'))
        print(f'wrote er-diagram.png  ({w}x{h})')
    except Exception as exc:
        print(f'PNG skipped: {type(exc).__name__}: {exc}')
