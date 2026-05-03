import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, FlatList, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Complete Nigeria Data Mapping (36 States + FCT)
const NIGERIA_DATA: Record<string, string[]> = {
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma Ngwa", "Ugwunagbo", "Ukwa West", "Ukwa East", "Umuahia North", "Umuahia South", "Umu Nneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Girei", "Gombi", "Guyuk", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat Enin", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Ovia North-East", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Itas/Gadau", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri South", "Onuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofas", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Kantom", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu", "Yewa North", "Yewa South"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Ife Central", "Ife East", "Ife North", "Ife South", "Egbedore", "Ejigbo", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Bokkos", "Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", " Gokana", "Ikwerre", "Oyigbo", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Adesina", "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
};

interface PersonalDetailsProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  userData: any;
  onSave: (newData: any) => void;
}

export default function PersonalDetailsModal({ visible, onClose, isDark, userData, onSave }: PersonalDetailsProps) {
  const insets = useSafeAreaInsets();
  
  // Modal Top Padding (Handles Android status bar properly inside Modals)
  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : insets.top;

  const [profileImage, setProfileImage] = useState(userData.image);
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [selectedState, setSelectedState] = useState(userData.state || "Select State");
  const [selectedLga, setSelectedLga] = useState(userData.lga || "Select LGA");
  const [address, setAddress] = useState(userData.address);

  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [lgaPickerVisible, setLgaPickerVisible] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Native beautiful crop UI
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleSave = () => {
    onSave({ profileImage, firstName, lastName, state: selectedState, lga: selectedLga, address });
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false} 
      statusBarTranslucent={true}
      navigationBarTranslucent={true} // Extends background to bottom edge
      onRequestClose={onClose}
    >
      <View style={[styles.fullModalContainer, isDark ? styles.containerDark : styles.containerLight]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        
        {/* Header - Dynamically padded to fill top screen gap */}
        <View style={[styles.modalHeaderFixed, isDark && styles.headerDark, { paddingTop: paddingTop + 10 }]}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="chevron-back" size={28} color={isDark ? '#fff' : '#0B2F66'} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Personal Details</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
            
            {/* BEAUTIFIED IMAGE SECTION */}
            <View style={styles.uploadSection}>
              <View style={[styles.dashedOuterRing, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}>
                <View style={[styles.uploadAvatarWrapper, { borderColor: isDark ? '#1F2937' : '#fff' }]}>
                  <Image source={{ uri: profileImage }} style={styles.uploadAvatar} />
                  <TouchableOpacity style={styles.uploadBadge} onPress={pickImage} activeOpacity={0.8}>
                    <Ionicons name="camera" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.uploadText, isDark && styles.textDark]}>Change Profile Picture</Text>
            </View>

            <ReadOnlyInput label="Username" value={userData.username} isDark={isDark} />
            <ReadOnlyInput label="Email Address" value={userData.email} isDark={isDark} />

            <InputItem label="First Name" value={firstName} onChange={setFirstName} isDark={isDark} />
            <InputItem label="Last Name" value={lastName} onChange={setLastName} isDark={isDark} />

            {/* STATE SELECTOR */}
            <TouchableOpacity style={styles.inputGroup} onPress={() => setStatePickerVisible(true)}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={[styles.editInput, isDark && styles.inputDark, styles.rowBetween]}>
                <Text style={[styles.inputText, isDark && { color: '#fff' }]}>{selectedState}</Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* LGA SELECTOR */}
            <TouchableOpacity 
              style={styles.inputGroup} 
              onPress={() => selectedState !== "Select State" ? setLgaPickerVisible(true) : alert("Please select a state first")}
            >
              <Text style={styles.inputLabel}>Local Government (LGA)</Text>
              <View style={[styles.editInput, isDark && styles.inputDark, styles.rowBetween]}>
                <Text style={[styles.inputText, isDark && { color: '#fff' }]}>{selectedLga}</Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <InputItem label="Full Address" value={address} onChange={setAddress} isDark={isDark} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* SEARCHABLE MODALS WITH GOOD SIGN (CHECKMARK) */}
      <SearchableSelectModal
        visible={statePickerVisible}
        title="Select State"
        currentValue={selectedState}
        data={Object.keys(NIGERIA_DATA).sort()}
        isDark={isDark}
        onClose={() => setStatePickerVisible(false)}
        onSelect={(val: string) => {
          setSelectedState(val);
          setSelectedLga("Select LGA"); // Reset LGA
          setStatePickerVisible(false);
        }}
      />

      <SearchableSelectModal
        visible={lgaPickerVisible}
        title={`Select LGA in ${selectedState}`}
        currentValue={selectedLga}
        data={(NIGERIA_DATA[selectedState] || []).sort()}
        isDark={isDark}
        onClose={() => setLgaPickerVisible(false)}
        onSelect={(val: string) => {
          setSelectedLga(val);
          setLgaPickerVisible(false);
        }}
      />
    </Modal>
  );
}

// --- FIXED SUB-MODAL: Added navigationBarTranslucent to fix bottom white gap ---
const SearchableSelectModal = ({ visible, title, data, isDark, onClose, onSelect, currentValue }: any) => {
  const [search, setSearch] = useState("");
  const filteredData = useMemo(() => 
    data.filter((item: string) => item.toLowerCase().includes(search.toLowerCase())),
    [search, data]
  );

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent 
      onRequestClose={onClose}
      statusBarTranslucent={true} 
      navigationBarTranslucent={true} // <-- THIS FIXES THE BOTTOM RED CIRCLE
    >
      <View style={styles.overlay}>
        <View style={[styles.selectModal, isDark && styles.cardDark]}>
          <View style={styles.selectHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? "#fff" : "#111827"} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchBox, isDark && styles.inputDark]}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput 
              placeholder="Search..." 
              placeholderTextColor="#9CA3AF" 
              style={[styles.searchInput, isDark && {color: '#fff'}]}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item === currentValue;
              return (
                <TouchableOpacity 
                  style={[styles.optionItem, isDark && styles.optionItemDark]} 
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.optionText, isDark && {color: '#fff'}, isSelected && { color: '#0B2F66', fontWeight: 'bold' }]}>
                    {item}
                  </Text>
                  {/* The "Good Sign" Checkmark */}
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const ReadOnlyInput = ({ label, value, isDark }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.disabledInput, isDark && styles.inputDark]}>
      <Text style={[styles.inputText, isDark && { color: '#9CA3AF' }]}>{value}</Text>
      <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
    </View>
  </View>
);

const InputItem = ({ label, value, onChange, isDark }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      style={[styles.editInput, isDark && styles.inputDark, isDark && { color: '#fff' }]} 
      value={value} 
      onChangeText={onChange} 
    />
  </View>
);

const styles = StyleSheet.create({
  fullModalContainer: { flex: 1 },
  containerLight: { backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  
  modalHeaderFixed: { 
    paddingHorizontal: 15, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff' 
  },
  headerDark: { backgroundColor: '#111827', borderBottomColor: '#374151' },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#fff' },
  closeBtn: { padding: 5 },
  
  // BEAUTIFIED IMAGE SECTION
  uploadSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  dashedOuterRing: {
    padding: 5,
    borderRadius: 75,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadAvatarWrapper: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 4, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  uploadAvatar: { width: '100%', height: '100%', borderRadius: 55 },
  uploadBadge: { 
    position: 'absolute', 
    bottom: -5, 
    right: -5, 
    backgroundColor: '#0B2F66', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#fff',
    elevation: 4,
  },
  uploadText: { marginTop: 15, fontSize: 15, color: '#6B7280', fontWeight: '700' },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '700' },
  disabledInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 14 },
  editInput: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', fontSize: 15 },
  inputDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  inputText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { backgroundColor: '#0B2F66', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  selectModal: { backgroundColor: '#fff', borderRadius: 24, maxHeight: '80%', padding: 20, elevation: 10 },
  cardDark: { backgroundColor: '#1F2937' },
  selectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, borderRadius: 12, marginBottom: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionItemDark: { borderBottomColor: '#374151' },
  optionText: { fontSize: 16, color: '#374151', fontWeight: '500' }
});
