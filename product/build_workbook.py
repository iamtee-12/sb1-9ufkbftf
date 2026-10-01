"""Builds the 'Calm Budget' workbook. Usage: python build_workbook.py OUT.xlsx [--sample] [--today YYYY-MM-DD]
--today pins the date (for tests and listing screenshots); the shipped product uses =TODAY()."""
import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule, DataBarRule, FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation

args = sys.argv[1:]
OUT = args[0]
SAMPLE = '--sample' in args
FIXED = dt.date.fromisoformat(args[args.index('--today') + 1]) if '--today' in args else None

F = 'Arial'
TEAL, INK, MUTED = '1F5F6B', '2B2B2B', '6B7280'
INPUT = PatternFill('solid', fgColor='FFF2CC')
AUTO = PatternFill('solid', fgColor='F2F2F2')
HEAD = PatternFill('solid', fgColor=TEAL)
SOFT = PatternFill('solid', fgColor='E6F2F4')
GREEN = PatternFill('solid', fgColor='C6EFCE')
AMBER = PatternFill('solid', fgColor='FFD59E')
PEACH = PatternFill('solid', fgColor='FCE4D6')
BLUE = PatternFill('solid', fgColor='DDEBF7')
thin = Side(style='thin', color='D9D9D9')
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
MONEY = '$#,##0.00'
MONEY0 = '$#,##0'
DATE = 'ddd mmm d'

def font(size=11, bold=False, color=INK, italic=False):
    return Font(name=F, size=size, bold=bold, color=color, italic=italic)

def put(ws, ref, value, fill=None, fmt=None, bold=False, size=11, color=INK, align=None, border=True, italic=False, wrap=False):
    c = ws[ref]
    c.value = value
    c.font = font(size, bold, color, italic)
    if fill: c.fill = fill
    if fmt: c.number_format = fmt
    c.alignment = Alignment(horizontal=align, vertical='center', wrap_text=wrap)
    if border and fill is not None: c.border = BOX
    return c

def header(ws, row, labels, start_col=1):
    for i, text in enumerate(labels):
        c = ws.cell(row=row, column=start_col + i, value=text)
        c.font = Font(name=F, size=11, bold=True, color='FFFFFF')
        c.fill = HEAD
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws.row_dimensions[row].height = 30

def title(ws, text, sub):
    ws['A1'].value = text; ws['A1'].font = font(20, True, TEAL)
    ws['A2'].value = sub; ws['A2'].font = font(10, False, MUTED, True)
    ws.row_dimensions[1].height = 32
    ws.sheet_view.showGridLines = False

def widths(ws, ws_widths):
    for col, w in ws_widths.items(): ws.column_dimensions[col].width = w

def page(ws, one_page=False):
    ws.page_setup.orientation = 'landscape'
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1 if one_page else 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True

wb = Workbook()
start = wb.active; start.title = 'Start Here'
today_ws = wb.create_sheet('Today')
setup = wb.create_sheet('Setup')
bills = wb.create_sheet('Bills')
spend = wb.create_sheet('Spending')
wait = wb.create_sheet('Wait List')
subs = wb.create_sheet('Subscriptions')
for ws, col in [(start, '1F5F6B'), (today_ws, '2E8B57'), (setup, 'F4B400'), (bills, '4F81BD'), (spend, '4F81BD'), (wait, 'A6A6A6'), (subs, 'A6A6A6')]:
    ws.sheet_properties.tabColor = col

TODAY = 'Setup!$B$13'; MSTART = 'Setup!$B$14'; MEND = 'Setup!$B$15'; DLEFT = 'Setup!$B$16'
B_FIRST, B_LAST = 5, 34
S_FIRST, S_LAST = 5, 1004
W_FIRST, W_LAST = 5, 104
U_FIRST, U_LAST = 5, 44

# ---------------- Setup ----------------
title(setup, 'Setup', 'Type only in the yellow cells. Grey cells fill themselves in.')
put(setup, 'A3', 'YOUR MONEY THIS MONTH', bold=True, color=TEAL, border=False)
for r in range(4, 8):
    put(setup, f'A{r}', None, INPUT)
    put(setup, f'B{r}', None, INPUT, MONEY)
put(setup, 'A8', 'Total income this month', AUTO, bold=True)
put(setup, 'B8', '=SUM(B4:B7)', AUTO, MONEY, bold=True)
put(setup, 'A10', 'Savings goal this month', INPUT)
put(setup, 'B10', None, INPUT, MONEY)
put(setup, 'A12', 'AUTOMATIC (no need to touch)', bold=True, color=TEAL, border=False)
put(setup, 'A13', "Today's date", AUTO)
put(setup, 'B13', f'=DATE({FIXED.year},{FIXED.month},{FIXED.day})' if FIXED else '=TODAY()', AUTO, 'ddd mmm d, yyyy', align='right')
put(setup, 'A14', 'Month being tracked (first day)', AUTO)
put(setup, 'B14', '=DATE(YEAR(B13),MONTH(B13),1)', AUTO, 'mmm d, yyyy', align='right')
put(setup, 'A15', 'Last day of that month', AUTO)
put(setup, 'B15', '=EOMONTH(B14,0)', AUTO, 'mmm d, yyyy', align='right')
put(setup, 'A16', 'Days left, counting today', AUTO)
put(setup, 'B16', '=MAX(1,B15-MAX(B13,B14)+1)', AUTO, '0', align='right')
put(setup, 'A18', 'To look at a past month, type its first day into B14 (example: 9/1/2026). Delete it to jump back to the current month.', color=MUTED, italic=True, size=9, border=False)
put(setup, 'D3', 'SPENDING CATEGORIES (rename them)', bold=True, color=TEAL, border=False)
cats = ['Groceries', 'Eating Out', 'Gas / Transport', 'Household', 'Health', 'Kids', 'Fun', 'Shopping', 'Pets', 'Gifts', 'Personal Care', 'Other']
for i, name in enumerate(cats):
    put(setup, f'D{4+i}', name, INPUT)
widths(setup, {'A': 34, 'B': 18, 'C': 4, 'D': 26})
if SAMPLE:
    for r, (n, v) in zip(range(4, 6), [('Paycheck 1', 1800), ('Paycheck 2', 1800)]):
        setup[f'A{r}'].value = n; setup[f'B{r}'].value = v
    setup['B10'].value = 300
page(setup)

# ---------------- Bills ----------------
title(bills, 'Bills', 'List each bill once. When you pay it, type the date paid (shortcut: Ctrl + ; puts in today). It resets itself every new month.')
put(bills, 'A3', 'Still to pay this month:', bold=True, border=False)
put(bills, 'B3', f'=SUM(B{B_FIRST}:B{B_LAST})-SUMIFS(B{B_FIRST}:B{B_LAST},F{B_FIRST}:F{B_LAST},"Paid")', AUTO, MONEY, bold=True)
header(bills, 4, ['Bill', 'Amount', 'Due day of month (1-31)', 'Date paid this month', 'Due date (auto)', 'Status (auto)'])
for r in range(B_FIRST, B_LAST + 1):
    put(bills, f'A{r}', None, INPUT)
    put(bills, f'B{r}', None, INPUT, MONEY)
    put(bills, f'C{r}', None, INPUT, '0', align='center')
    put(bills, f'D{r}', None, INPUT, DATE, align='center')
    put(bills, f'E{r}', f'=IF(OR($A{r}="",$C{r}=""),"",DATE(YEAR({MSTART}),MONTH({MSTART}),MIN($C{r},DAY({MEND}))))', AUTO, DATE, align='center')
    put(bills, f'F{r}', f'=IF($A{r}="","",IF(AND($D{r}<>"",$D{r}>={MSTART}),"Paid",IF($E{r}<{TODAY},"Overdue",IF($E{r}-{TODAY}<=3,"Due soon","Upcoming"))))', AUTO, align='center')
rng = f'F{B_FIRST}:F{B_LAST}'
bills.conditional_formatting.add(rng, CellIsRule(operator='equal', formula=['"Paid"'], fill=GREEN))
bills.conditional_formatting.add(rng, CellIsRule(operator='equal', formula=['"Overdue"'], fill=AMBER))
bills.conditional_formatting.add(rng, CellIsRule(operator='equal', formula=['"Due soon"'], fill=PEACH))
dv = DataValidation(type='whole', operator='between', formula1='1', formula2='31', allow_blank=True,
                    errorTitle='Due day', error='Type a number from 1 to 31 (the day of the month the bill is due).')
bills.add_data_validation(dv); dv.add(f'C{B_FIRST}:C{B_LAST}')
widths(bills, {'A': 30, 'B': 14, 'C': 16, 'D': 18, 'E': 16, 'F': 16})
bills.freeze_panes = 'A5'
if SAMPLE:
    d = FIXED or dt.date.today()
    first = d.replace(day=1)
    rows = [('Rent', 1200, 1, first), ('Internet', 60, 10, first.replace(day=10)), ('Phone', 65, 15, None),
            ('Electric', 110, 20, None), ('Car insurance', 140, 25, None)]
    for i, (n, a, due, paid) in enumerate(rows):
        r = B_FIRST + i
        bills[f'A{r}'].value = n; bills[f'B{r}'].value = a; bills[f'C{r}'].value = due
        if paid: bills[f'D{r}'].value = paid
page(bills)

# ---------------- Spending ----------------
title(spend, 'Spending', 'Log everyday spending here (groceries, coffee, gas). Bills go on the Bills tab, not here. Shortcut: Ctrl + ; types in today.')
put(spend, 'A3', 'Spent this month:', bold=True, border=False)
put(spend, 'B3', f'=SUMIFS(D{S_FIRST}:D{S_LAST},A{S_FIRST}:A{S_LAST},">="&{MSTART},A{S_FIRST}:A{S_LAST},"<="&{MEND})', AUTO, MONEY, bold=True)
header(spend, 4, ['Date', 'What', 'Category', 'Amount', 'Note (optional)'])
for r in range(S_FIRST, S_LAST + 1):
    put(spend, f'A{r}', None, INPUT, DATE, align='center')
    put(spend, f'B{r}', None, INPUT)
    put(spend, f'C{r}', None, INPUT)
    put(spend, f'D{r}', None, INPUT, MONEY)
    put(spend, f'E{r}', None, INPUT)
dvc = DataValidation(type='list', formula1='=Setup!$D$4:$D$15', allow_blank=True)
spend.add_data_validation(dvc); dvc.add(f'C{S_FIRST}:C{S_LAST}')
widths(spend, {'A': 14, 'B': 30, 'C': 20, 'D': 14, 'E': 34})
spend.freeze_panes = 'A5'
if SAMPLE:
    d = FIXED or dt.date.today()
    base = d.replace(day=1)
    items = [(1, 'Weekly groceries', 'Groceries', 96.40), (2, 'Coffee', 'Eating Out', 5.75), (3, 'Gas', 'Gas / Transport', 42.10),
             (5, 'Pizza night', 'Eating Out', 31.50), (6, 'Dog food', 'Pets', 38.99), (8, 'Pharmacy', 'Health', 17.25),
             (9, 'Groceries', 'Groceries', 82.15), (11, 'Movie tickets', 'Fun', 28.00), (12, 'Birthday gift', 'Gifts', 25.00),
             (14, 'Gas', 'Gas / Transport', 39.80), (15, 'Lunch out', 'Eating Out', 14.20), (16, 'Cleaning supplies', 'Household', 21.60),
             (17, 'Groceries', 'Groceries', 74.30), (18, 'Coffee', 'Eating Out', 5.75)]
    r = S_FIRST
    for day, what, cat, amt in items:
        dd = base + dt.timedelta(days=day - 1)
        if dd <= d:
            spend[f'A{r}'].value = dd; spend[f'B{r}'].value = what; spend[f'C{r}'].value = cat; spend[f'D{r}'].value = amt; r += 1
page(spend)

# ---------------- Wait List ----------------
title(wait, 'Wait List', "Want something right now? Write it here first. If you still want it tomorrow, buy it. Skipping counts as a win.")
put(wait, 'A3', 'Saved by skipping:', bold=True, border=False)
put(wait, 'B3', f'=SUMIF(E{W_FIRST}:E{W_LAST},"Skipped",B{W_FIRST}:B{W_LAST})', AUTO, MONEY, bold=True)
header(wait, 4, ['I want...', 'Price', 'Date added', 'Decide on (auto)', 'My decision', 'Status (auto)'])
for r in range(W_FIRST, W_LAST + 1):
    put(wait, f'A{r}', None, INPUT)
    put(wait, f'B{r}', None, INPUT, MONEY)
    put(wait, f'C{r}', None, INPUT, DATE, align='center')
    put(wait, f'D{r}', f'=IF(C{r}="","",C{r}+1)', AUTO, DATE, align='center')
    put(wait, f'E{r}', None, INPUT, align='center')
    put(wait, f'F{r}', f'=IF(A{r}="","",IF(OR(E{r}="",E{r}="Waiting"),IF(D{r}="","",IF({TODAY}>=D{r},"Ready to decide","Wait until "&TEXT(D{r},"mmm d"))),E{r}))', AUTO, align='center')
dvw = DataValidation(type='list', formula1='"Waiting,Skipped,Bought"', allow_blank=True)
wait.add_data_validation(dvw); dvw.add(f'E{W_FIRST}:E{W_LAST}')
wait.conditional_formatting.add(f'F{W_FIRST}:F{W_LAST}', CellIsRule(operator='equal', formula=['"Ready to decide"'], fill=BLUE))
wait.conditional_formatting.add(f'F{W_FIRST}:F{W_LAST}', CellIsRule(operator='equal', formula=['"Skipped"'], fill=GREEN))
widths(wait, {'A': 34, 'B': 12, 'C': 14, 'D': 16, 'E': 16, 'F': 20})
wait.freeze_panes = 'A5'
if SAMPLE:
    d = FIXED or dt.date.today()
    for i, (n, p, ago, dec) in enumerate([('Air fryer', 89.99, 6, 'Skipped'), ('New headphones', 129.00, 2, 'Waiting'), ('Phone case', 18.50, 0, 'Waiting'), ('Houseplant', 24.00, 9, 'Bought')]):
        r = W_FIRST + i
        wait[f'A{r}'].value = n; wait[f'B{r}'].value = p; wait[f'C{r}'].value = d - dt.timedelta(days=ago); wait[f'E{r}'].value = dec
page(wait)

# ---------------- Subscriptions ----------------
title(subs, 'Subscriptions', 'List everything that charges you automatically. Type the date you last actually used it and the sheet will nudge you.')
put(subs, 'A3', 'Total per month:', bold=True, border=False)
put(subs, 'B3', f'=SUM(D{U_FIRST}:D{U_LAST})', AUTO, MONEY, bold=True)
put(subs, 'C3', 'Per year:', bold=True, border=False, align='right')
put(subs, 'D3', '=B3*12', AUTO, MONEY, bold=True)
header(subs, 4, ['Subscription', 'Cost', 'Billed', 'Per month (auto)', 'Last used', 'Check-in (auto)'])
for r in range(U_FIRST, U_LAST + 1):
    put(subs, f'A{r}', None, INPUT)
    put(subs, f'B{r}', None, INPUT, MONEY)
    put(subs, f'C{r}', None, INPUT, align='center')
    put(subs, f'D{r}', f'=IF(OR(A{r}="",B{r}=""),"",IF(C{r}="Yearly",B{r}/12,B{r}))', AUTO, MONEY)
    put(subs, f'E{r}', None, INPUT, DATE, align='center')
    put(subs, f'F{r}', f'=IF(OR(A{r}="",E{r}=""),"",IF({TODAY}-E{r}>30,"Not used in 30+ days: keep or cancel?","In use"))', AUTO)
dvs = DataValidation(type='list', formula1='"Monthly,Yearly"', allow_blank=True)
subs.add_data_validation(dvs); dvs.add(f'C{U_FIRST}:C{U_LAST}')
subs.conditional_formatting.add(f'F{U_FIRST}:F{U_LAST}', FormulaRule(formula=[f'LEFT(F{U_FIRST},3)="Not"'], fill=PEACH))
widths(subs, {'A': 28, 'B': 12, 'C': 12, 'D': 16, 'E': 14, 'F': 38})
subs.freeze_panes = 'A5'
if SAMPLE:
    d = FIXED or dt.date.today()
    for i, (n, c, b, ago) in enumerate([('Streaming service', 15.49, 'Monthly', 3), ('Gym membership', 29.99, 'Monthly', 75), ('Cloud storage', 29.99, 'Yearly', 20), ('Music app', 10.99, 'Monthly', 1)]):
        r = U_FIRST + i
        subs[f'A{r}'].value = n; subs[f'B{r}'].value = c; subs[f'C{r}'].value = b; subs[f'E{r}'].value = d - dt.timedelta(days=ago)
page(subs)

# ---------------- Today (dashboard) ----------------
title(today_ws, 'Today', None)
today_ws['A2'].value = f'=TEXT({TODAY},"dddd, mmmm d")'
today_ws['A2'].font = font(12, False, MUTED)
today_ws.merge_cells('A4:E4'); put(today_ws, 'A4', 'SAFE TO SPEND TODAY', SOFT, bold=True, color=TEAL, align='center', size=12)
today_ws.merge_cells('A5:E5'); put(today_ws, 'A5', '=MAX(0,B16-B15)', SOFT, MONEY0, bold=True, size=44, color=TEAL, align='center')
today_ws.row_dimensions[5].height = 66
today_ws.merge_cells('A6:E6')
put(today_ws, 'A6', '=IF(B9=0,"Start in Setup: add your income and this fills itself in.",IF(B13<0,"You are a little over this month. That is okay. Pause the extras and keep going.",IF(B15>B16,"Today\'s budget is used up. Tomorrow is a fresh start.","You are on track. Spend within this number and you are fine.")))', SOFT, align='center', size=11, wrap=True)
today_ws.row_dimensions[6].height = 34

put(today_ws, 'A8', 'THE MATH', bold=True, color=TEAL, border=False)
rows = [
    (9, 'Income this month', '=Setup!B8'),
    (10, 'Bills', f'=SUM(Bills!B{B_FIRST}:B{B_LAST})'),
    (11, 'Savings goal', '=Setup!B10'),
    (12, 'Spent so far (everyday)', f'=Spending!B3'),
    (13, 'Left for the rest of the month', '=B9-B10-B11-B12'),
    (14, 'Days left (counting today)', f'={DLEFT}'),
    (15, 'Spent today', f'=SUMIFS(Spending!D{S_FIRST}:D{S_LAST},Spending!A{S_FIRST}:A{S_LAST},{TODAY})'),
    (16, 'Daily budget', '=(B13+B15)/B14'),
]
for r, label, f in rows:
    put(today_ws, f'A{r}', label, AUTO, bold=(r == 13))
    put(today_ws, f'B{r}', f, AUTO, '0' if r == 14 else MONEY, bold=(r == 13))

put(today_ws, 'D8', 'AT A GLANCE', bold=True, color=TEAL, border=False)
glance = [
    (9, 'Bills overdue', f'=COUNTIF(Bills!F{B_FIRST}:F{B_LAST},"Overdue")', '0'),
    (10, 'Bills due in 3 days', f'=COUNTIF(Bills!F{B_FIRST}:F{B_LAST},"Due soon")', '0'),
    (11, 'Bills paid', f'=COUNTIF(Bills!F{B_FIRST}:F{B_LAST},"Paid")', '0'),
    (12, 'Still to pay', '=Bills!B3', MONEY),
    (13, 'Saved by waiting', "='Wait List'!B3", MONEY),
    (14, 'Subscriptions / month', '=Subscriptions!B3', MONEY),
]
for r, label, f, fmt in glance:
    put(today_ws, f'D{r}', label, AUTO)
    put(today_ws, f'E{r}', f, AUTO, fmt, align='right')
today_ws.conditional_formatting.add('E9', CellIsRule(operator='greaterThan', formula=['0'], fill=AMBER))
today_ws.conditional_formatting.add('E10', CellIsRule(operator='greaterThan', formula=['0'], fill=PEACH))

put(today_ws, 'A18', 'WHERE THE MONEY WENT THIS MONTH', bold=True, color=TEAL, border=False)
for i in range(12):
    r = 19 + i
    put(today_ws, f'A{r}', f'=IF(Setup!D{4+i}="","",Setup!D{4+i})', AUTO)
    put(today_ws, f'B{r}', f'=IF(A{r}="","",SUMIFS(Spending!$D${S_FIRST}:$D${S_LAST},Spending!$C${S_FIRST}:$C${S_LAST},A{r},Spending!$A${S_FIRST}:$A${S_LAST},">="&{MSTART},Spending!$A${S_FIRST}:$A${S_LAST},"<="&{MEND}))', AUTO, MONEY)
today_ws.conditional_formatting.add('B19:B30', DataBarRule(start_type='num', start_value=0, end_type='max', color='8FBFC9', showValue=True))
widths(today_ws, {'A': 34, 'B': 16, 'C': 4, 'D': 26, 'E': 16})
page(today_ws, True)

# ---------------- Start Here ----------------
title(start, 'Calm Budget Planner', 'A budget with one number that matters: how much you can spend today. Built to be quick, kind, and low-effort.')
widths(start, {'A': 4, 'B': 120})
lines = [
    ('START HERE: 3 STEPS, ABOUT 5 MINUTES', 'h'),
    ('1.  Setup tab: type your income and savings goal in the yellow cells.', 't'),
    ('2.  Bills tab: list your bills and the day each is due. When you pay one, type the date (Ctrl + ; types in today).', 't'),
    ('3.  Spending tab: add a line whenever you buy something.', 't'),
    ('', 't'),
    ('THEN OPEN THE TODAY TAB', 'h'),
    ('It shows how much you can safely spend today. That is the whole point.', 't'),
    ('', 't'),
    ('THE ONLY RULES', 'h'),
    ('Yellow cells = you type.   Grey cells = automatic, leave them alone.', 't'),
    ('Never delete rows. To remove something, clear its yellow cells.', 't'),
    ('New month? Do nothing. It rolls over by itself.', 't'),
    ('Fell behind? Add things whenever you remember. No streaks, no shame.', 't'),
    ('', 't'),
    ('OPTIONAL EXTRAS (skip them if you like)', 'h'),
    ('Wait List: write an impulse want here first. Still want it tomorrow? Buy it. Skipped items add up as money saved.', 't'),
    ('Subscriptions: see what you pay each month and get nudged about ones you have stopped using.', 't'),
    ('', 't'),
    ('OPENING THE FILE', 'h'),
    ('Excel: just open it.   Google Sheets: upload to Google Drive, open with Google Sheets, then File > Save as Google Sheets.', 't'),
    ('', 't'),
    ('Tips: other currency = select the money cells > Format > Currency. Past month = type its first day into Setup cell B14 (delete it to come back).', 'n'),
    ('How the Today number works: (income - bills - savings - everyday spending) spread over the days left this month.', 'n'),
    ('A budgeting tool, not financial, medical or legal advice. "ADHD-friendly" describes the simple design; it is not a treatment.', 'n'),
]
r = 4
for text, kind in lines:
    c = start[f'B{r}']
    c.value = text
    c.alignment = Alignment(wrap_text=True, vertical='center')
    if kind == 'h':
        c.font = Font(name=F, size=12, bold=True, color='FFFFFF'); c.fill = HEAD
        start.row_dimensions[r].height = 24
    elif kind == 'n':
        c.font = font(9, False, MUTED, True)
    else:
        c.font = font(11)
        if len(text) > 120: start.row_dimensions[r].height = 32
    r += 1
page(start, True)

if '--shots' in args:  # listing screenshots only: print just the filled area, one tight page per tab
    for ws, area in [(setup, 'A1:E18'), (bills, 'A1:F13'), (spend, 'A1:E21'), (wait, 'A1:F11'), (subs, 'A1:F11')]:
        ws.print_area = area
        page(ws, True)
wb.save(OUT)
print('saved', OUT)
