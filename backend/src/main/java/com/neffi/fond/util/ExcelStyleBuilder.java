package com.neffi.fond.util;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Constructor de estilos para Excel.
 * Encapsula la lógica de creación y configuración de estilos XLSX.
 */
public class ExcelStyleBuilder {

    private final XSSFWorkbook workbook;
    private XSSFCellStyle titleStyle;
    private XSSFCellStyle subtitleStyle;
    private XSSFCellStyle headerStyle;
    private XSSFCellStyle dataStyle;
    private XSSFCellStyle dataStyleAlternate;
    private XSSFCellStyle numberStyle;
    private XSSFCellStyle dateStyle;

    public ExcelStyleBuilder(XSSFWorkbook workbook) {
        this.workbook = workbook;
        initializeStyles();
    }

    private void initializeStyles() {
        this.titleStyle = buildTitleStyle();
        this.subtitleStyle = buildSubtitleStyle();
        this.headerStyle = buildHeaderStyle();
        this.dataStyle = buildDataStyle(false);
        this.dataStyleAlternate = buildDataStyle(true);
        this.numberStyle = buildNumberStyle();
        this.dateStyle = buildDateStyle();
    }

    public XSSFCellStyle getTitleStyle() {
        return titleStyle;
    }

    public XSSFCellStyle getSubtitleStyle() {
        return subtitleStyle;
    }

    public XSSFCellStyle getHeaderStyle() {
        return headerStyle;
    }

    public XSSFCellStyle getDataStyle() {
        return dataStyle;
    }

    public XSSFCellStyle getDataStyleAlternate() {
        return dataStyleAlternate;
    }

    public XSSFCellStyle getNumberStyle() {
        return numberStyle;
    }

    public XSSFCellStyle getDateStyle() {
        return dateStyle;
    }

    private XSSFCellStyle buildTitleStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(new byte[]{30, 64, 127}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle buildSubtitleStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 219, (byte) 234, (byte) 254}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        font.setColor(new XSSFColor(new byte[]{30, 64, 127}, null));
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle buildHeaderStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(new byte[]{55, 48, (byte) 163}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBottomBorderColor(IndexedColors.WHITE.getIndex());

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle buildDataStyle(boolean alternate) {
        XSSFCellStyle style = workbook.createCellStyle();

        if (alternate) {
            style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 238, (byte) 242, (byte) 255}, null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }

        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(
            new XSSFColor(new byte[]{(byte) 224, (byte) 231, (byte) 255}, null).getIndex()
        );

        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle buildNumberStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(
            new XSSFColor(new byte[]{(byte) 224, (byte) 231, (byte) 255}, null).getIndex()
        );

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle buildDateStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(
            new XSSFColor(new byte[]{(byte) 224, (byte) 231, (byte) 255}, null).getIndex()
        );

        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(new byte[]{99, 102, (byte) 241}, null));
        font.setFontName("Calibri");
        style.setFont(font);

        return style;
    }
}
