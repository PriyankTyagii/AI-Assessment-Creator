import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { Result } from '@/types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    padding: 40,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  headerSubject: { fontSize: 12, marginTop: 3 },
  headerMeta: { flexDirection: 'row', gap: 24, marginTop: 6, fontSize: 10, color: '#374151' },
  instructionsBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  instructionsTitle: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, color: '#6b7280' },
  instructionItem: { fontSize: 9, color: '#374151', marginBottom: 2 },
  studentInfo: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 10,
    marginBottom: 10,
  },
  studentField: { flexDirection: 'row', flex: 1, alignItems: 'flex-end', gap: 4 },
  studentLabel: { fontSize: 10, fontWeight: 'bold', color: '#374151', whiteSpace: 'nowrap' },
  studentLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#9ca3af', height: 14 },
  sectionContainer: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionMarks: { fontSize: 9, color: '#6b7280' },
  sectionInstruction: { fontSize: 9, color: '#6b7280', fontStyle: 'italic', marginBottom: 6 },
  questionRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  questionNumber: { fontSize: 10, fontWeight: 'bold', width: 24, paddingTop: 1 },
  questionBody: { flex: 1 },
  questionText: { fontSize: 10, lineHeight: 1.5, color: '#1f2937' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 2 },
  optionItem: { flexDirection: 'row', gap: 4, width: '48%' },
  optionLetter: { fontSize: 9, color: '#6b7280', width: 14 },
  optionText: { fontSize: 9, color: '#374151', flex: 1 },
  questionMeta: { alignItems: 'flex-end', gap: 4, minWidth: 70 },
  diffBadge: { fontSize: 8, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  marksText: { fontSize: 9, fontWeight: 'bold', color: '#374151' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 6 },
});

const diffStyle = {
  easy: { backgroundColor: '#ecfdf5', color: '#065f46' },
  medium: { backgroundColor: '#fffbeb', color: '#92400e' },
  hard: { backgroundColor: '#fef2f2', color: '#991b1b' },
};

function PDFDocument({ result }: { result: Result }) {
  const { metadata, sections } = result;
  let questionOffset = 0;

  return (
    <Document title={metadata.title}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{metadata.title}</Text>
          <Text style={styles.headerSubject}>{metadata.subject}</Text>
          <View style={styles.headerMeta}>
            <Text>Total Marks: {metadata.totalMarks}</Text>
            {metadata.duration && <Text>Time: {metadata.duration} min</Text>}
            <Text>Date: {format(new Date(), 'dd MMM yyyy')}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>General Instructions</Text>
          <Text style={styles.instructionItem}>• All questions are compulsory unless stated otherwise.</Text>
          <Text style={styles.instructionItem}>• Write your name, roll number, and section on the answer sheet.</Text>
          <Text style={styles.instructionItem}>• Read each question carefully before answering.</Text>
        </View>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          {['Name', 'Roll Number', 'Section'].map((f) => (
            <View key={f} style={styles.studentField}>
              <Text style={styles.studentLabel}>{f}:</Text>
              <View style={styles.studentLine} />
            </View>
          ))}
        </View>

        {/* Sections */}
        {sections.map((section) => {
          const offset = questionOffset;
          questionOffset += section.questions.length;
          const sectionMarks = section.questions.reduce((s, q) => s + q.marks, 0);
          return (
            <View key={section.id} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionMarks}>{sectionMarks} Marks</Text>
              </View>
              <Text style={styles.sectionInstruction}>{section.instruction}</Text>

              {section.questions.map((q, i) => (
                <View key={q.id} style={styles.questionRow} wrap={false}>
                  <Text style={styles.questionNumber}>{offset + i + 1}.</Text>
                  <View style={styles.questionBody}>
                    <Text style={styles.questionText}>{q.text}</Text>
                    {q.options && q.options.length > 0 && (
                      <View style={styles.optionsGrid}>
                        {q.options.map((opt, oi) => (
                          <View key={oi} style={styles.optionItem}>
                            <Text style={styles.optionLetter}>{String.fromCharCode(65 + oi)}.</Text>
                            <Text style={styles.optionText}>{opt}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.questionMeta}>
                    <Text style={[styles.diffBadge, diffStyle[q.difficulty]]}>
                      {q.difficulty === 'medium' ? 'Moderate' : q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                    </Text>
                    <Text style={styles.marksText}>[{q.marks} {q.marks === 1 ? 'Mk' : 'Mks'}]</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        <Text style={styles.footer} fixed>
          Generated by VedaAI Assessment Creator
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadPDF(result: Result): Promise<void> {
  const blob = await pdf(<PDFDocument result={result} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${result.metadata.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
