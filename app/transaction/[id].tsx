import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Import our new tools
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';

// 1. Mock Data (matching the list from RecentTransactions)
const TRANSACTIONS = [
  { id: '1', type: 'MTN', title: 'MTN Data (10GB)', date: 'Oct 27, 2023', time: '10:42 AM', amount: '3,000.00', status: 'Successful', ref: 'TRX-9283746510', phone: '08123456789' },
  { id: '2', type: 'AIRTEL', title: 'Airtel Airtime', date: 'Oct 26, 2023', time: '02:15 PM', amount: '1,000.00', status: 'Successful', ref: 'TRX-1029384756', phone: '09012345678' },
  { id: '3', type: 'GLO', title: 'Glo Data (2.5GB)', date: 'Oct 25, 2023', time: '09:00 AM', amount: '1,200.00', status: 'Failed', ref: 'TRX-5566778899', phone: '08056131455' },
  { id: '4', type: 'ELECTRICITY', title: 'Ikeja Electric', date: 'Oct 23, 2023', time: '06:30 PM', amount: '15,000.00', status: 'Successful', ref: 'TRX-1122334455', meter: '45091238475', token: '4829-1039-4820-1928' },
  { id: '5', type: '9MOBILE', title: '9mobile Airtime', date: 'Oct 22, 2023', time: '11:20 AM', amount: '500.00', status: 'Successful', ref: 'TRX-9988776655', phone: '08098159865' },
  { id: '6', type: 'CABLE', title: 'DSTV Premium', date: 'Oct 20, 2023', time: '08:00 AM', amount: '24,500.00', status: 'Pending', ref: 'TRX-3344556677', smartcard: '1029384756' },
];

export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  // Ref for the ViewShot wrapper
  const viewShotRef = useRef<ViewShot>(null);

  const tx = TRANSACTIONS.find(item => item.id === id);

  if (!tx) return <SafeAreaView style={styles.container}><Text>Transaction not found</Text></SafeAreaView>;

  const getStatusColor = (status: string) => {
    if (status === 'Successful') return '#10B981';
    if (status === 'Failed') return '#EF4444';
    return '#F59E0B';
  };

  // --- PDF GENERATION LOGIC ---
  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fb; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .receipt { background: white; padding: 40px; border-radius: 15px; width: 80%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .status { font-size: 24px; font-weight: bold; color: ${getStatusColor(tx.status)}; margin-bottom: 10px; }
            .amount { font-size: 42px; font-weight: 900; margin: 0; color: #111827; }
            .title { color: #6b7280; font-size: 18px; }
            .divider { border-top: 2px dashed #e5e7eb; margin: 30px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 16px; }
            .label { color: #6b7280; }
            .value { font-weight: bold; color: #111827; }
            .token-box { background: #f9fafb; padding: 20px; text-align: center; border-radius: 10px; border: 1px solid #e5e7eb; margin-top: 20px; }
            .token-lbl { font-size: 12px; color: #6b7280; letter-spacing: 2px; }
            .token-val { font-size: 28px; font-weight: bold; color: #0b2f66; letter-spacing: 3px; margin: 10px 0 0 0; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="status">${tx.status}</div>
              <p class="amount">₦${tx.amount}</p>
              <span class="title">${tx.title}</span>
            </div>
            <div class="divider"></div>
            <div class="row"><span class="label">Date & Time</span><span class="value">${tx.date} • ${tx.time}</span></div>
            <div class="row"><span class="label">Reference ID</span><span class="value">${tx.ref}</span></div>
            ${tx.phone ? `<div class="row"><span class="label">Phone Number</span><span class="value">${tx.phone}</span></div>` : ''}
            ${tx.meter ? `<div class="row"><span class="label">Meter Number</span><span class="value">${tx.meter}</span></div>` : ''}
            ${tx.smartcard ? `<div class="row"><span class="label">Smartcard</span><span class="value">${tx.smartcard}</span></div>` : ''}
            <div class="row"><span class="label">Payment Method</span><span class="value">Wallet</span></div>
            
            ${tx.token ? `
              <div class="token-box">
                <div class="token-lbl">ELECTRICITY TOKEN</div>
                <p class="token-val">${tx.token}</p>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    try {
      // Create the PDF file
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Allow user to share or save the generated PDF
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  // --- IMAGE CAPTURE LOGIC ---
  const captureImage = async () => {
    try {
      // Ensure we have permission to save to camera roll
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      // Capture the receipt view as an image URI
      const uri = await viewShotRef.current?.capture?.();
      
      if (!uri) throw new Error("Could not capture image");

      if (status === 'granted') {
         // Save to gallery
         await MediaLibrary.saveToLibraryAsync(uri);
         Alert.alert('Saved!', 'Receipt image saved to your photo gallery.');
      } else {
         // Fallback to sharing the image if no gallery permission
         await Sharing.shareAsync(uri);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image.');
    }
  };

  const handleShareText = async () => {
    try {
      await Share.share({
        message: `Receipt for ${tx.title}\nAmount: ₦${tx.amount}\nStatus: ${tx.status}\nRef: ${tx.ref}`,
      });
    } catch (error: any) {
      Alert.alert('Error sharing transaction.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, isDark && styles.textDark]}>Transaction Details</Text>
        <TouchableOpacity onPress={handleShareText}>
          <Ionicons name="share-social-outline" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* We wrap ONLY the receipt card in ViewShot so the buttons don't show up in the image */}
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1.0 }} style={{ backgroundColor: isDark ? '#111827' : '#F4F7FB' }}>
            <View style={[styles.receiptCard, isDark && styles.receiptCardDark]}>
              
              <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(tx.status) + '1A' }]}>
                <Ionicons 
                    name={tx.status === 'Successful' ? "checkmark-circle" : tx.status === 'Failed' ? "close-circle" : "time"} 
                    size={60} 
                    color={getStatusColor(tx.status)} 
                />
              </View>

              <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>{tx.status}</Text>
              <Text style={[styles.amountText, isDark && styles.textDark]}>₦{tx.amount}</Text>
              <Text style={styles.txTitle}>{tx.title}</Text>

              {/* Cutout Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.sideCutout, styles.leftCutout, isDark && styles.containerDark]} />
                <View style={styles.dashedLine} />
                <View style={[styles.sideCutout, styles.rightCutout, isDark && styles.containerDark]} />
              </View>

              <View style={styles.detailsContainer}>
                <DetailRow label="Transaction Date" value={`${tx.date} • ${tx.time}`} isDark={isDark} />
                <DetailRow label="Reference ID" value={tx.ref} isDark={isDark} isCopyable />
                
                {tx.phone && <DetailRow label="Phone Number" value={tx.phone} isDark={isDark} />}
                {tx.meter && <DetailRow label="Meter Number" value={tx.meter} isDark={isDark} />}
                {tx.smartcard && <DetailRow label="Smartcard Number" value={tx.smartcard} isDark={isDark} />}
                
                <DetailRow label="Payment Method" value="Wallet" isDark={isDark} />

                {tx.token && (
                    <View style={[styles.tokenBox, isDark && styles.tokenBoxDark]}>
                      <Text style={styles.tokenLabel}>ELECTRICITY TOKEN</Text>
                      <Text style={styles.tokenValue}>{tx.token}</Text>
                    </View>
                )}
              </View>

            </View>
        </ViewShot>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.downloadBtn]} onPress={generatePDF}>
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Save PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.imageBtn]} onPress={captureImage}>
                <Ionicons name="image-outline" size={20} color="#0B2F66" />
                <Text style={[styles.actionBtnText, { color: '#0B2F66' }]}>Save Image</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.reportBtn}>
            <Text style={styles.reportText}>Need help with this transaction?</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component
const DetailRow = ({ label, value, isDark, isCopyable }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.detailValue, isDark && { color: '#F9FAFB' }]}>{value}</Text>
        {isCopyable && <Ionicons name="copy-outline" size={14} color="#6B7280" style={{ marginLeft: 5 }} />}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  containerDark: { backgroundColor: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { padding: 5 },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B2F66' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

  // Receipt Card
  receiptCard: { backgroundColor: '#fff', borderRadius: 24, paddingVertical: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  receiptCardDark: { backgroundColor: '#1F2937' },
  
  statusIconContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  statusText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  amountText: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 5 },
  txTitle: { fontSize: 14, color: '#6B7280', marginBottom: 25 },

  // Divider UI
  dividerContainer: { width: '100%', height: 30, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dashedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 1 },
  sideCutout: { width: 30, height: 30, borderRadius: 15, position: 'absolute', backgroundColor: '#F4F7FB', zIndex: 10 },
  leftCutout: { left: -15 },
  rightCutout: { right: -15 },

  // Details
  detailsContainer: { width: '100%', paddingHorizontal: 25 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  detailLabel: { fontSize: 13, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },

  // Token Box
  tokenBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 15, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  tokenBoxDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
  tokenLabel: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', letterSpacing: 1, marginBottom: 5 },
  tokenValue: { fontSize: 18, fontWeight: 'bold', color: '#0B2F66', letterSpacing: 2 },

  // Buttons
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  actionBtn: { flex: 0.48, height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  downloadBtn: { backgroundColor: '#0B2F66' },
  imageBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0B2F66' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  reportBtn: { marginTop: 25, alignSelf: 'center' },
  reportText: { color: '#EF4444', fontWeight: '600', fontSize: 14 }
});