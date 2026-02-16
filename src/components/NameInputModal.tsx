import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface NameInputModalProps {
  visible: boolean;
  title: string;
  defaultValue: string;
  confirmLabel: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function NameInputModal({
  visible,
  title,
  defaultValue,
  confirmLabel,
  onConfirm,
  onCancel,
}: NameInputModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (visible) setValue(defaultValue);
  }, [visible, defaultValue]);

  function handleConfirm() {
    onConfirm(value.trim() || defaultValue);
    setValue(defaultValue);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      transparent={false}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 pt-6 px-5">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            {title}
          </Text>

          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
            value={value}
            onChangeText={setValue}
            placeholder="Enter name"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-3"
            activeOpacity={0.8}
            onPress={handleConfirm}
          >
            <Text className="text-white text-lg font-semibold">
              {confirmLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl py-4 items-center border border-gray-200"
            activeOpacity={0.8}
            onPress={onCancel}
          >
            <Text className="text-gray-700 text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
