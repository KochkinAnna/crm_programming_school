import * as ExcelJS from 'exceljs';

export class ExcelUtil {
  static addHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]): void {
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ADD8E6' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }

  static applyStyles(worksheet: ExcelJS.Worksheet): void {
    const allCells = worksheet.getCell(
      `A1:${worksheet.getColumn(worksheet.columnCount).letter}1`,
    );
    allCells.fill = null;

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(30, Math.max(10, maxLength + 2));

      column.eachCell((cell) => {
        cell.alignment = { wrapText: true };
      });
    });
  }
}
