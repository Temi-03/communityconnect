import { useState } from "react";
import {View,Text,TextInput,Pressable,StyleSheet,Platform,ScrollView,KeyboardAvoidingView,} from "react-native";
import { auth } from "../../firebase";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { createTask } from "../../services/taskService";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [town, setTown] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function formatDate(date: any) {
    if (!date) return "Select due date & time";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }

  function openDateTimePicker() {
  setPickerMode("date");
  setShowPicker(true);
}

 function handlePickerChange(event: any, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (!selectedDate) {
      setShowPicker(false);
      return;
    }

    if (pickerMode === "date") {
      const current = dueAt || new Date();

      const updatedDate = new Date(current);
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());

      setDueAt(updatedDate);

      if (Platform.OS === "android") {
        setShowPicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowPicker(true);
        }, 100);
      }
    } else {
      const current = dueAt || new Date();

      const updatedDate = new Date(current);
      updatedDate.setHours(selectedDate.getHours());
      updatedDate.setMinutes(selectedDate.getMinutes());
      updatedDate.setSeconds(0);
      updatedDate.setMilliseconds(0);

      setDueAt(updatedDate);
      setShowPicker(false);
    }
  }


  async function handleCreateTask() {
    try {
      setLoading(true);
      setError("");

      const owner = auth.currentUser?.uid;
      if (!owner) throw new Error("No logged-in user");
      if (!title.trim()) throw new Error("Title is required.");
      if (!details.trim()) throw new Error("Details are required.");
      if (!town.trim()) throw new Error("Town is required.");
      if (!dueAt) throw new Error("Due time  is required.");

      await createTask(owner, {
        title,
        details,
        location: town,
        dueAt,
      });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} >
      <ScrollView contentContainerStyle={styles.container}keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
         <Text style={styles.title}>Create Task</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder="Title"
            placeholderTextColor="#000000"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            autoComplete="off"
          />

          <TextInput
            placeholder="Details"
            placeholderTextColor="#000000"
            style={[styles.input, { height: 80 }]}
            value={details}
            onChangeText={setDetails}
            multiline
              autoComplete="off"

          />

         <GooglePlacesAutocomplete
            placeholder="Town"
            fetchDetails={false}
            onPress={(data) => {
              const townName = data.description.split(",")[0].trim();
              setTown(townName);
            }}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
              language: "en",
               components: "country:ie",
            }}
            textInputProps={{
                placeholderTextColor: "#000000",
            }}
            styles={{
              textInput: styles.input,
              container: { width: "100%" },
              listView: {
                borderRadius: 12,
                marginTop: -8,
                overflow: "hidden",
              },
              placeholder: { color: "#e8ab55" },
            }}
          /> 

          <Pressable
            onPress={openDateTimePicker}
            style={[styles.input, { justifyContent: "center" }]}>
            <Text>{formatDate(dueAt)}</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={dueAt || new Date()}
              mode={pickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              themeVariant="light" 
              onChange={handlePickerChange}
            />
          )}
           {Platform.OS === "ios" && showPicker && pickerMode === "date" && (
            <Pressable
              onPress={() => setPickerMode("time")}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Choose Time</Text>
            </Pressable>
          )}

          {Platform.OS === "ios" && showPicker && pickerMode === "time" && (
            <Pressable
              onPress={() => setShowPicker(false)}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Done</Text>
            </Pressable>
          )}


          <Pressable
            onPress={handleCreateTask}
            disabled={loading}
            style={[styles.createBtn, loading && { opacity: 0.7 }]}>
            <Text style={styles.createBtnText}>
              {loading ? "Creating..." : "Create Task"}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  
  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#111",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
   
  },

  createBtn: {
    backgroundColor: "#3D8D34",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  createBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  error: {
    color: "crimson",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#f3f3f3",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  secondaryBtnText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelText: {
    color: "#555",
    fontWeight: "700",
  },
});
