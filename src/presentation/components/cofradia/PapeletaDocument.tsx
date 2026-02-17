
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#fff',
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
    },
    borderContainer: {
        borderWidth: 2,
        borderColor: '#1a1a1a',
        padding: 2,
        height: '100%',
    },
    innerBorder: {
        borderWidth: 1,
        borderColor: '#1a1a1a',
        padding: 30,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 5,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        textTransform: 'uppercase',
        marginBottom: 30,
        color: '#4a4a4a',
    },
    divider: {
        width: '60%',
        height: 1,
        backgroundColor: '#1a1a1a',
        marginBottom: 30,
    },
    body: {
        fontSize: 12,
        lineHeight: 1.8,
        textAlign: 'center',
        width: '100%',
    },
    mainText: {
        marginBottom: 40,
    },
    bold: {
        // Quitamos fontWeight para evitar errores de carga de fuente
        color: '#000',
    },
    highlightRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 40,
    },
    dataBox: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
        minWidth: 120,
        alignItems: 'center',
    },
    label: {
        fontSize: 8,
        textTransform: 'uppercase',
        color: '#888',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        width: '100%',
    },
    date: {
        fontSize: 10,
        color: '#666',
        marginBottom: 40,
    },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    signatureBox: {
        width: 140,
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
        alignItems: 'center',
    },
    signatureLabel: {
        fontSize: 9,
        textTransform: 'uppercase',
    }
});

interface PapeletaDocumentProps {
    papeleta: any;
    hermano: any;
    puesto?: string;
}

export const PapeletaDocument: React.FC<PapeletaDocumentProps> = ({ papeleta, hermano, puesto }) => {
    if (!papeleta || !hermano) return null;
    const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

    return (
        <Document title={`Papeleta - ${hermano.nombre} ${hermano.apellido1}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.borderContainer}>
                    <View style={styles.innerBorder}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Papeleta de Sitio</Text>
                            <Text style={styles.subtitle}>Semana Santa {papeleta.anio}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.body}>
                            <Text style={styles.mainText}>
                                Esta Real e Ilustre Hermandad certifica que el hermano D/Dña.{"\n"}
                                <Text style={styles.bold}>{hermano.nombre} {hermano.apellido1} {hermano.apellido2 || ''}</Text>{"\n"}
                                con el número de hermano <Text style={styles.bold}>{hermano.numeroHermano || '---'}</Text>,{"\n"}
                                tiene asignado su sitio en la Estación de Penitencia del presente año.
                            </Text>

                            <View style={styles.highlightRow}>
                                <View style={styles.dataBox}>
                                    <Text style={styles.label}>Puesto / Función</Text>
                                    <Text style={styles.value}>{puesto || papeleta.observaciones || 'Nazareno'}</Text>
                                </View>
                                <View style={styles.dataBox}>
                                    <Text style={styles.label}>Estado Estación</Text>
                                    <Text style={styles.value}>{papeleta.estado}</Text>
                                </View>
                                <View style={styles.dataBox}>
                                    <Text style={styles.label}>Nº Papeleta</Text>
                                    <Text style={styles.value}>{papeleta.id.slice(0, 8).toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.date}>Emitida en Secretaría el {today}</Text>

                            <View style={styles.signatures}>
                                <View style={styles.signatureBox}>
                                    <Text style={styles.signatureLabel}>El Secretario</Text>
                                </View>
                                <View style={styles.signatureBox}>
                                    <Text style={styles.signatureLabel}>Sello de la Hermandad</Text>
                                </View>
                                <View style={styles.signatureBox}>
                                    <Text style={styles.signatureLabel}>El Hermano Mayor</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
