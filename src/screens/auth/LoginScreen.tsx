import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PasswordInput } from "../../components/PasswordInput";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, typography } from "../../theme/tokens";
import { useNavigation } from "@react-navigation/native";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) Alert.alert("Error logging in", error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Luna account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            onChangeText={setPassword}
            value={password}
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={signInWithEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  inner: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center"
  },
  header: {
    marginBottom: spacing.xl
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted
  },
  form: {
    gap: spacing.md
  },
  label: {
    fontSize: typography.caption,
    fontWeight: "600",
    color: colors.text,
    marginBottom: -spacing.sm
  },
  input: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.body
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.md
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.body,
    fontWeight: "600"
  },
  link: {
    alignItems: "center",
    marginTop: spacing.md
  },
  linkText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "500"
  }
});
