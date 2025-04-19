import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	FlatList,
	StyleSheet,
	Dimensions,
} from "react-native";
import { COLORS, FONTS } from "../../constants/theme";

interface DropdownOption {
	name: string;
	gram: number;
}

interface DropdownSelectProps {
	label: string;
	options: DropdownOption[];
	value: DropdownOption;
	onSelect: (option: DropdownOption) => void;
	placeholder?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
	label,
	options,
	value,
	onSelect,
	placeholder = "Pilih item...",
}) => {
	const [modalVisible, setModalVisible] = useState(false);

	const handleSelect = (option: DropdownOption) => {
		onSelect(option);
		setModalVisible(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>
			<TouchableOpacity
				style={styles.dropdown}
				onPress={() => setModalVisible(true)}
			>
				<Text
					style={value.name ? styles.selectedValue : styles.placeholderValue}
				>
					{value.name ? `${value.name} (${value.gram}g)` : placeholder}
				</Text>
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setModalVisible(false)}
				>
					<View
						style={styles.modalContent}
						onStartShouldSetResponder={() => true}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{label}</Text>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Text style={styles.closeButton}>X</Text>
							</TouchableOpacity>
						</View>

						<FlatList
							data={options}
							keyExtractor={(item, index) => `${item.name}-${index}`}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.optionItem}
									onPress={() => handleSelect(item)}
								>
									<Text style={styles.optionText}>{item.name}</Text>
									<Text style={styles.gramText}>{item.gram}g</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
	container: {
		marginBottom: 12,
	},
	label: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: "#333",
		marginBottom: 6,
	},
	dropdown: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		backgroundColor: "#fff",
	},
	selectedValue: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#333",
	},
	placeholderValue: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#999",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: height * 0.7,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	modalTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: "#333",
	},
	closeButton: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.primary,
	},
	optionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	optionText: {
		...FONTS.fontRegular,
		fontSize: 16,
		color: "#333",
	},
	gramText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
	},
});

export default DropdownSelect;
