import sys
import io
import json
import re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import openpyxl

wb = openpyxl.load_workbook('لستة ادويه التأمين.xlsx')
ws = wb['المجاني']

# Print EVERY non-empty row from row 58 to row 140 (Group 3 area)
print("=== Group 3 Area (rows 58-145) ===")
for i, row in enumerate(ws.iter_rows(min_row=58, max_row=145, values_only=True), start=58):
    non_none = [v for v in row if v is not None]
    if non_none:
        print(f"row {i}: {[repr(str(v)) for v in row[:6] if v is not None]}")

print()
print("=== Around Group 33 end and groups 34/35 (rows 870-1014) ===")
for i, row in enumerate(ws.iter_rows(min_row=870, max_row=1014, values_only=True), start=870):
    non_none = [v for v in row if v is not None]
    if non_none:
        print(f"row {i}: {[repr(str(v)) for v in row[:6] if v is not None]}")

print()
print("=== All unique Description Authority values ===")
authorities = set()
for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
    if row[4] is not None:
        authorities.add(str(row[4]).strip())
for a in sorted(authorities, key=lambda x: x.lower()):
    print(f"  '{a}'")
