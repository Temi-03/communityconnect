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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function formatDate(date: any) {
    if (!date) return "Select due date & time";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
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
            placeholderTextColor="#e8ab55"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            autoComplete="off"
          />

          <TextInput
            placeholder="Details"
            placeholderTextColor="#e8ab55"
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
            onPress={() => setShowPicker(true)}
            style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: "#e8ab55" }}>{formatDate(dueAt)}</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={dueAt || new Date()}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              themeVariant="light" 
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDueAt(selectedDate);
              }}
            />
          )}

          <Pressable
            onPress={handleCreateTask}
            disabled={loading}
            style={[styles.createBtn, loading && { opacity: 0.7 }]}>
            <Text style={styles.createBtnText}>
              {loading ? "Creating..." : "Create Task"}
            </Text>
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
    color: "#e8ab55",
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
});
