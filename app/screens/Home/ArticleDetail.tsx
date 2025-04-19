import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ActivityIndicator,
	Share,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";

type ArticleDetailProps = StackScreenProps<RootStackParamList, "ArticleDetail">;

// Article interface
interface Article {
	id: string;
	title: string;
	content: string;
	image: any;
	author: string;
	date: string;
	readTime: string;
}

// Dummy articles data with full content
const articlesData: Record<string, Article> = {
	"1": {
		id: "1",
		title: "ARTIKEL DIABETES MELLITUS",
		content: ``, // Content will be rendered with components instead of string
		image: IMAGES.article1,
		author: "Dr. Siti Nurhayati",
		date: "Jan 10, 2024",
		readTime: "8 min read",
	},
	"2": {
		id: "2",
		title: "ARTIKEL KADAR GULA DARAH",
		content: `TABEL KADAR GULA DARAH`,
		image: IMAGES.article2,
		author: "Dr. Agus Wirawan",
		date: "Dec 12, 2023",
		readTime: "5 min read",
	},
};

export const ArticleDetail = ({ route, navigation }: ArticleDetailProps) => {
	const { articleId } = route.params;
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate fetching article data
		const fetchArticle = () => {
			setLoading(true);

			// In a real app, this would be an API call
			setTimeout(() => {
				if (articleId && articlesData[articleId]) {
					setArticle(articlesData[articleId]);
				}
				setLoading(false);
			}, 800);
		};

		fetchArticle();
	}, [articleId]);

	const handleShare = async () => {
		if (article) {
			try {
				await Share.share({
					message: `Baca artikel "${article.title}" di Aplikasi Glucacore`,
					title: article.title,
				});
			} catch (error) {
				console.error("Error sharing article:", error);
			}
		}
	};

	const renderDiabetesArticle = () => {
		return (
			<View style={styles.structuredContent}>
				{/* a. Pengertian */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>a. Pengertian</Text>
					<Text style={styles.paragraphText}>
						Diabetes Mellitus Tipe 2 adalah penyakit yang terjadi ketika kadar
						gula dalam darah terlalu tinggi karena tubuh tidak bisa menghasilkan
						cukup insulin atau tidak bisa menggunakannya dengan baik. Akibatnya,
						gula tidak dapat masuk ke dalam sel untuk digunakan sebagai energi,
						sehingga dapat merusak berbagai organ dan jaringan tubuh.
					</Text>
				</View>

				{/* b. Penyebab */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>b. Penyebab</Text>

					{/* 1) Usia */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>1)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Usia</Text>
							<Text style={styles.paragraphText}>
								Risiko terkena diabetes meningkat seiring bertambahnya usia,
								terutama setelah usia 45 tahun, karena aktivitas fisik berkurang
								dan berat badan cenderung naik.
							</Text>
						</View>
					</View>

					{/* 2) Kurang Gerak */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>2)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Kurang Gerak</Text>
							<Text style={styles.paragraphText}>
								Jarang berolahraga membuat tubuh sulit mengontrol gula darah dan
								berat badan, sehingga risiko diabetes jadi lebih tinggi.
							</Text>
						</View>
					</View>

					{/* 3) Kelebihan Berat Badan */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>3)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>
								Kelebihan Berat Badan (Obesitas)
							</Text>
							<Text style={styles.paragraphText}>
								Lemak tubuh yang berlebihan bisa mengganggu cara kerja insulin
								dalam mengatur gula darah.
							</Text>
						</View>
					</View>

					{/* 4) Pola Makan Tidak Sehat */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>4)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Pola Makan Tidak Sehat</Text>
							<Text style={styles.paragraphText}>
								Makan tidak teratur, terlalu banyak makanan manis atau berlemak,
								bisa merusak kerja pankreas dan menyebabkan gula darah tidak
								stabil.
							</Text>
						</View>
					</View>

					{/* 5) Stres */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>5)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Stres</Text>
							<Text style={styles.paragraphText}>
								Stres berlebihan membuat tubuh bekerja lebih keras dan bisa
								merusak pankreas, organ yang menghasilkan insulin.
							</Text>
						</View>
					</View>
				</View>

				{/* c. Tanda dan gejala */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>c. Tanda dan gejala</Text>
					<Text style={styles.paragraphText}>
						Menurut Firuni et al., (2023) tanda dan gejala diabetes mellitus
						antara lain:
					</Text>

					{/* List of symptoms */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>1)</Text>
						<Text style={styles.paragraphText}>
							Polidipsia (minum berlebihan)
						</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>2)</Text>
						<Text style={styles.paragraphText}>
							Poliuria (buang air kecil sering atau banyak)
						</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>3)</Text>
						<Text style={styles.paragraphText}>
							Polifagia (makan terlalu banyak)
						</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>4)</Text>
						<Text style={styles.paragraphText}>Kelemahan fisik yang umum</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>5)</Text>
						<Text style={styles.paragraphText}>Penurunan berat badan</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>6)</Text>
						<Text style={styles.paragraphText}>
							Cepat lelah, tidak ada tenaga
						</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>7)</Text>
						<Text style={styles.paragraphText}>Kesemutan</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>8)</Text>
						<Text style={styles.paragraphText}>Mata kabur</Text>
					</View>
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>9)</Text>
						<Text style={styles.paragraphText}>Gatal di vulva pada wanita</Text>
					</View>
				</View>

				{/* d. Komplikasi */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>d. Komplikasi</Text>

					{/* 1) Kerusakan Pembuluh Darah */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>1)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Kerusakan Pembuluh Darah</Text>
							<Text style={styles.paragraphText}>
								Kadar gula darah tinggi dalam jangka panjang dapat merusak
								pembuluh darah kecil, yang menyebabkan masalah pada berbagai
								organ termasuk mata, ginjal, dan saraf.
							</Text>
						</View>
					</View>

					{/* 2) Penyakit Jantung */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>2)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Penyakit Jantung</Text>
							<Text style={styles.paragraphText}>
								Diabetes meningkatkan risiko penyakit jantung, stroke, dan
								masalah pembuluh darah lainnya.
							</Text>
						</View>
					</View>

					{/* 3) Neuropati */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>3)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Neuropati (Kerusakan Saraf)</Text>
							<Text style={styles.paragraphText}>
								Kerusakan saraf, terutama di kaki, menyebabkan mati rasa,
								kesemutan, nyeri, atau kelemahan yang dimulai dari ujung jari
								kaki atau jari tangan dan secara bertahap menyebar ke atas.
							</Text>
						</View>
					</View>

					{/* 4) Nefropati */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>4)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Nefropati (Kerusakan Ginjal)</Text>
							<Text style={styles.paragraphText}>
								Diabetes dapat merusak sistem penyaringan ginjal, menyebabkan
								gagal ginjal atau penyakit ginjal stadium akhir yang memerlukan
								dialisis atau transplantasi.
							</Text>
						</View>
					</View>

					{/* 5) Retinopati */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>5)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Retinopati (Kerusakan Mata)</Text>
							<Text style={styles.paragraphText}>
								Kerusakan pembuluh darah di retina mata dapat menyebabkan
								gangguan penglihatan hingga kebutaan jika tidak diobati.
							</Text>
						</View>
					</View>
				</View>

				{/* e. Diagnosis */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>e. Diagnosis</Text>
					<Text style={styles.paragraphText}>
						Diagnosis diabetes melitus tipe 2 berdasarkan hasil pemeriksaan
						kadar gula darah berikut:
					</Text>

					{/* 1) Pemeriksaan Gula Darah Puasa */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>1)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Pemeriksaan Gula Darah Puasa</Text>
							<Text style={styles.paragraphText}>
								Dilakukan setelah berpuasa selama minimal 8 jam. Kadar gula
								darah puasa ≥ 126 mg/dL mengindikasikan diabetes.
							</Text>
						</View>
					</View>

					{/* 2) Pemeriksaan Gula Darah Sewaktu */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>2)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>
								Pemeriksaan Gula Darah Sewaktu
							</Text>
							<Text style={styles.paragraphText}>
								Dilakukan kapan saja tanpa memperhatikan waktu makan terakhir.
								Kadar gula darah sewaktu ≥ 200 mg/dL disertai gejala klasik
								diabetes mengindikasikan diabetes.
							</Text>
						</View>
					</View>

					{/* 3) Tes Toleransi Glukosa Oral */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>3)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Tes Toleransi Glukosa Oral</Text>
							<Text style={styles.paragraphText}>
								Dilakukan dengan memberikan larutan glukosa, kemudian mengukur
								kadar gula darah setelah 2 jam. Kadar gula darah ≥ 200 mg/dL
								mengindikasikan diabetes.
							</Text>
						</View>
					</View>

					{/* 4) Pemeriksaan HbA1c */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>4)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Pemeriksaan HbA1c</Text>
							<Text style={styles.paragraphText}>
								Menunjukkan rata-rata kadar gula darah selama 2-3 bulan
								terakhir. Nilai HbA1c ≥ 6.5% mengindikasikan diabetes.
							</Text>
						</View>
					</View>
				</View>

				{/* f. Pencegahan */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>f. Pencegahan</Text>

					{/* 1) Menjaga Berat Badan Ideal */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>1)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Menjaga Berat Badan Ideal</Text>
							<Text style={styles.paragraphText}>
								Jaga berat badan dalam rentang normal (IMT 18.5-22.9) untuk
								mengurangi risiko diabetes. Jika memiliki kelebihan berat badan,
								menurunkan 5-10% berat badan dapat mengurangi risiko secara
								signifikan.
							</Text>
						</View>
					</View>

					{/* 2) Aktivitas Fisik Teratur */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>2)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Aktivitas Fisik Teratur</Text>
							<Text style={styles.paragraphText}>
								Lakukan aktivitas fisik sedang minimal 150 menit per minggu atau
								aktivitas fisik berat minimal 75 menit per minggu. Aktivitas
								fisik membantu meningkatkan sensitivitas insulin.
							</Text>
						</View>
					</View>

					{/* 3) Pola Makan Sehat */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>3)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Pola Makan Sehat</Text>
							<Text style={styles.paragraphText}>
								Konsumsi makanan tinggi serat, rendah lemak jenuh dan gula
								tambahan. Pilih karbohidrat kompleks seperti biji-bijian utuh,
								buah-buahan, dan sayuran. Batasi makanan olahan dan minuman
								manis.
							</Text>
						</View>
					</View>

					{/* 4) Hindari Stres Berkepanjangan */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>4)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Hindari Stres Berkepanjangan</Text>
							<Text style={styles.paragraphText}>
								Kelola stres dengan teknik relaksasi, meditasi, atau aktivitas
								yang menyenangkan. Stres kronis dapat meningkatkan kadar hormon
								stres yang mempengaruhi kadar gula darah.
							</Text>
						</View>
					</View>

					{/* 5) Rutin Pemeriksaan Kesehatan */}
					<View style={styles.listItemContainer}>
						<Text style={styles.listNumber}>5)</Text>
						<View style={styles.listContent}>
							<Text style={styles.listTitle}>Rutin Pemeriksaan Kesehatan</Text>
							<Text style={styles.paragraphText}>
								Lakukan pemeriksaan kesehatan dan skrining diabetes secara
								rutin, terutama jika memiliki faktor risiko seperti riwayat
								keluarga diabetes, obesitas, atau tekanan darah tinggi.
							</Text>
						</View>
					</View>
				</View>
			</View>
		);
	};

	const renderTable = () => {
		return (
			<View style={styles.tableContainer}>
				<View style={styles.tableRow}>
					<View style={[styles.tableCell, styles.tableHeader]}>
						<Text style={styles.tableHeaderText}>Pemeriksaan</Text>
					</View>
					<View style={[styles.tableCell, styles.tableHeader]}>
						<Text style={styles.tableHeaderText}>Normal</Text>
					</View>
					<View style={[styles.tableCell, styles.tableHeader]}>
						<Text style={styles.tableHeaderText}>Pre-Diabetes</Text>
					</View>
					<View style={[styles.tableCell, styles.tableHeader]}>
						<Text style={styles.tableHeaderText}>Diabetes</Text>
					</View>
				</View>

				<View style={styles.tableRow}>
					<View style={[styles.tableCell, styles.firstColumn]}>
						<Text style={styles.tableCellText}>HbA1c</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{"<5,7 mg/dL"}</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>5,7 – 6,4 mg/dL</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{">6,5 mg/dL"}</Text>
					</View>
				</View>

				<View style={styles.tableRow}>
					<View style={[styles.tableCell, styles.firstColumn]}>
						<Text style={styles.tableCellText}>Kadar Gula Darah Puasa</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{"<100 mg/dL"}</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>100 – 125 mg/dL</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{">126 mg/dL"}</Text>
					</View>
				</View>

				<View style={styles.tableRow}>
					<View style={[styles.tableCell, styles.firstColumn]}>
						<Text style={styles.tableCellText}>Kadar Gula Darah 2 Jam PP</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{"<140 mg/dL"}</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>140 – 179 mg/dL</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{">180 mg/dL"}</Text>
					</View>
				</View>

				<View style={styles.tableRow}>
					<View style={[styles.tableCell, styles.firstColumn]}>
						<Text style={styles.tableCellText}>Kadar Gula Darah Sewaktu</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{"<200 mg/dL"}</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>-</Text>
					</View>
					<View style={styles.tableCell}>
						<Text style={styles.tableCellText}>{">200 mg/dL"}</Text>
					</View>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.primary} />
				<Text style={styles.loadingText}>Memuat artikel...</Text>
			</SafeAreaView>
		);
	}

	if (!article) {
		return (
			<SafeAreaView style={styles.errorContainer}>
				<Text style={styles.errorText}>Artikel tidak ditemukan</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.backButtonText}>Kembali</Text>
				</TouchableOpacity>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Image source={IMAGES.iconLeft} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Detail Artikel</Text>
				<TouchableOpacity style={styles.shareButton} onPress={handleShare}>
					<Image source={IMAGES.share} style={styles.shareIcon} />
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{/* Article Image */}
				<View style={styles.imageContainer}>
					<Image source={article.image} style={styles.articleImage} />
				</View>

				{/* Article Content */}
				<View style={styles.contentContainer}>
					<Text style={styles.title}>{article.title}</Text>

					<View style={styles.metaContainer}>
						<Image source={IMAGES.user2} style={styles.authorIcon} />
						<Text style={styles.authorText}>{article.author}</Text>
						<View style={styles.divider} />
						<Text style={styles.dateText}>{article.date}</Text>
						<View style={styles.divider} />
						<Text style={styles.readTimeText}>{article.readTime}</Text>
					</View>

					{article.id === "2" ? renderTable() : renderDiabetesArticle()}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.white,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.white,
	},
	loadingText: {
		...FONTS.fontMedium,
		marginTop: 15,
		color: COLORS.light,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.white,
		padding: 20,
	},
	errorText: {
		...FONTS.fontMedium,
		fontSize: 18,
		color: COLORS.dark,
		marginBottom: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		paddingVertical: 12,
		backgroundColor: COLORS.white,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	headerTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.dark,
	},
	backButton: {
		padding: 8,
	},
	backIcon: {
		width: 24,
		height: 24,
		tintColor: COLORS.dark,
	},
	shareButton: {
		padding: 8,
	},
	shareIcon: {
		width: 22,
		height: 22,
		tintColor: COLORS.primaryBlue,
	},
	scrollView: {
		flex: 1,
	},
	imageContainer: {
		width: "100%",
		height: 220,
		backgroundColor: "#f0f0f0",
	},
	articleImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	contentContainer: {
		padding: 20,
	},
	title: {
		...FONTS.fontSemiBold,
		fontSize: 22,
		color: COLORS.dark,
		marginBottom: 15,
	},
	metaContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 25,
		flexWrap: "wrap",
	},
	authorIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
	},
	authorText: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: COLORS.dark,
	},
	divider: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: COLORS.primaryBlue,
		marginHorizontal: 8,
	},
	dateText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.primaryBlue,
	},
	readTimeText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.primaryBlue,
	},
	contentText: {
		...FONTS.fontRegular,
		fontSize: 16,
		color: COLORS.dark,
		lineHeight: 26,
		textAlign: "justify",
	},
	backButtonText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: COLORS.primary,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#f0f8ff",
		borderRadius: 8,
	},
	tableContainer: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		marginVertical: 15,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: "#ddd",
	},
	tableCell: {
		flex: 1,
		padding: 10,
		justifyContent: "center",
		borderRightWidth: 1,
		borderColor: "#ddd",
	},
	firstColumn: {
		flex: 1.5,
		backgroundColor: "#f9f9f9",
	},
	tableHeader: {
		backgroundColor: COLORS.primary,
	},
	tableHeaderText: {
		...FONTS.fontSemiBold,
		fontSize: 14,
		color: COLORS.white,
		textAlign: "center",
	},
	tableCellText: {
		...FONTS.fontRegular,
		fontSize: 14,
		textAlign: "center",
		color: COLORS.dark,
	},
	structuredContent: {
		flex: 1,
	},
	sectionContainer: {
		marginBottom: 20,
	},
	sectionTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.dark,
		marginBottom: 10,
	},
	paragraphText: {
		...FONTS.fontRegular,
		fontSize: 16,
		color: COLORS.dark,
		lineHeight: 24,
		textAlign: "justify",
	},
	listItemContainer: {
		flexDirection: "row",
		marginBottom: 8,
		paddingLeft: 5,
	},
	listNumber: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: COLORS.dark,
		width: 25,
	},
	listContent: {
		flex: 1,
	},
	listTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: COLORS.dark,
		marginBottom: 4,
	},
});

export default ArticleDetail;
