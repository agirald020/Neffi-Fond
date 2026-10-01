package com.neffi.fond.util;

import com.neffi.fond.dto.TransaccionInternaResponse;
import com.neffi.fond.exception.custom.ExcelExportException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Genera el archivo Excel de transacciones internas usando los estilos
 * compartidos de ExcelStyleBuilder. Primer consumidor real de
 * ExcelStyleBuilder/ExcelResponseUtils en el proyecto.
 */
@Component
public class TransaccionInternaExcelExporter {

    private static final String[] HEADERS = {
            "Codigo", "Nombre", "Descripcion", "Senal Ing/Egr", "% Impuesto",
            "Codigo Trx Afecta", "Afecta Acumulados", "Entra Canje", "Clase",
            "Senal Anulacion", "Cod Trx Dev Rnds", "Cod Trx Dev Comi", "Cod Trx Dev Otros",
            "Cod Trx Homologacion", "Desc Reportes", "Cobra Impuestos", "Grupo Trx", "Envio SMS"
    };

    public byte[] export(List<TransaccionInternaResponse> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            ExcelStyleBuilder styles = new ExcelStyleBuilder(workbook);
            XSSFSheet sheet = workbook.createSheet("Transacciones internas");

            Cell titleCell = sheet.createRow(0).createCell(0);
            titleCell.setCellValue("Transacciones internas");
            titleCell.setCellStyle(styles.getTitleStyle());

            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(styles.getHeaderStyle());
            }

            int rowIndex = 3;
            for (TransaccionInternaResponse t : rows) {
                Row row = sheet.createRow(rowIndex);
                XSSFCellStyle textStyle = (rowIndex % 2 == 0) ? styles.getDataStyleAlternate() : styles.getDataStyle();
                XSSFCellStyle numberStyle = styles.getNumberStyle();

                writeCell(row, 0, texto(t.codigoReferencia()), numberStyle);
                writeCell(row, 1, t.nombreTransaccion(), textStyle);
                writeCell(row, 2, t.descripcion(), textStyle);
                writeCell(row, 3, t.senalIngEgr(), textStyle);
                writeCell(row, 4, t.porceImpuesto() == null ? "" : t.porceImpuesto().toPlainString(), numberStyle);
                writeCell(row, 5, texto(t.codigoTrxAfecta()), textStyle);
                writeCell(row, 6, t.afectaCampoAcumulados(), textStyle);
                writeCell(row, 7, t.entraCanje(), textStyle);
                writeCell(row, 8, t.claseTransaccion(), textStyle);
                writeCell(row, 9, t.senalAnulacion(), textStyle);
                writeCell(row, 10, texto(t.codTrxDevRnds()), textStyle);
                writeCell(row, 11, texto(t.codTrxDevComi()), textStyle);
                writeCell(row, 12, texto(t.codTrxDevOtros()), textStyle);
                writeCell(row, 13, texto(t.codTrxHomolgacion()), textStyle);
                writeCell(row, 14, t.descReportes(), textStyle);
                writeCell(row, 15, t.cobraImptos(), textStyle);
                writeCell(row, 16, t.grupoTrx(), textStyle);
                writeCell(row, 17, t.envioSms(), textStyle);
                rowIndex++;
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new ExcelExportException("No se pudo generar el archivo Excel de transacciones internas", ex);
        }
    }

    private String texto(Long valor) {
        return valor == null ? "" : String.valueOf(valor);
    }

    private void writeCell(Row row, int column, String value, XSSFCellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value == null ? "" : value);
        cell.setCellStyle(style);
    }
}
