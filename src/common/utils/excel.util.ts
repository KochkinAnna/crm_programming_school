import * as ExcelJS from 'exceljs';

export class ExcelUtil {
  static addHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]): void {
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6495ED' },
      }; // Cornflower Blue (#6495ED)
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }

  static applyColumnStyle(
    worksheet: ExcelJS.Worksheet,
    columns: string[],
    style: any,
  ): void {
    worksheet.columns.forEach((column) => {
      if (column.header && columns.includes(column.header.toString())) {
        column.eachCell((cell) => {
          Object.assign(cell, style);
        });
      }
    });
  }

  static applyStyles(worksheet: ExcelJS.Worksheet): void {
    const managerGroupColumns = ['Group'];
    const nameSurnamePhoneColumns = ['Name', 'Surname', 'Phone'];

    const managerGroupStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
      }, // Жовтий (#FFFF00)
    };

    const nameSurnamePhoneStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFADD8E6' },
      }, // Світло голубий (#ADD8E6)
    };

    ExcelUtil.applyColumnStyle(
      worksheet,
      managerGroupColumns,
      managerGroupStyle,
    );
    ExcelUtil.applyColumnStyle(
      worksheet,
      nameSurnamePhoneColumns,
      nameSurnamePhoneStyle,
    );
  }
}
