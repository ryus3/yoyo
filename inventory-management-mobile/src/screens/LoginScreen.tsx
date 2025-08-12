@@ .. @@
 import React, { useState } from 'react';
-import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
+import { 
+  View, 
+  Text, 
+  TextInput, 
+  TouchableOpacity, 
+  StyleSheet, 
+  Alert,
+  KeyboardAvoidingView,
+  Platform,
+  ScrollView
+} from 'react-native';
+import { Ionicons } from '@expo/vector-icons';
 import { useAuth } from '../contexts/AuthContext';
 
 export default function LoginScreen() {
-  const [email, setEmail] = useState('');
+  const [loginIdentifier, setLoginIdentifier] = useState('');
   const [password, setPassword] = useState('');
+  const [showPassword, setShowPassword] = useState(false);
+  const [isRegistering, setIsRegistering] = useState(false);
+  const [fullName, setFullName] = useState('');
+  const [username, setUsername] = useState('');
+  const [email, setEmail] = useState('');
   const [loading, setLoading] = useState(false);
-  const { login } = useAuth();
+  const { login, loginWithUsername, register } = useAuth();
 
-  const handleLogin = async () => {
-    if (!email || !password) {
-      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
+  const handleLogin = async () => {
+    if (!loginIdentifier || !password) {
+      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
       return;
     }
 
     setLoading(true);
-    const result = await login(email, password);
+    
+    // تحديد نوع تسجيل الدخول (بريد إلكتروني أم اسم مستخدم)
+    const isEmail = loginIdentifier.includes('@');
+    const result = isEmail 
+      ? await login(loginIdentifier, password)
+      : await loginWithUsername(loginIdentifier, password);
+    
     setLoading(false);
 
     if (!result.success) {
@@ -165,6 +345,29 @@ export default function LoginScreen() {
     }
   };
 
+  const handleRegister = async () => {
+    if (!fullName || !username || !email || !password) {
+      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
+      return;
+    }
+
+    setLoading(true);
+    const result = await register(fullName, username, email, password);
+    setLoading(false);
+
+    if (!result.success) {
+      Alert.alert('خطأ', result.error || 'حدث خطأ غير متوقع');
+    } else {
+      Alert.alert(
+        'تم التسجيل بنجاح', 
+        'سيقوم المدير بمراجعة طلبك وتفعيله قريباً.',
+        [{ text: 'موافق', onPress: () => setIsRegistering(false) }]
+      );
+    }
+  };
+
   return (
-    <View style={styles.container}>
-      <Text style={styles.title}>تسجيل الدخول</Text>
-      
-      <TextInput
-        style={styles.input}
-        placeholder="البريد الإلكتروني"
-        value={email}
-        onChangeText={setEmail}
-        keyboardType="email-address"
-        autoCapitalize="none"
-      />
-      
-      <TextInput
-        style={styles.input}
-        placeholder="كلمة المرور"
-        value={password}
-        onChangeText={setPassword}
-        secureTextEntry
-      />
-      
-      <TouchableOpacity 
-        style={[styles.button, loading && styles.buttonDisabled]} 
-        onPress={handleLogin}
-        disabled={loading}
-      >
-        <Text style={styles.buttonText}>
-          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
-        </Text>
-      </TouchableOpacity>
-    </View>
+    <KeyboardAvoidingView 
+      style={styles.container} 
+      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
+    >
+      <ScrollView contentContainerStyle={styles.scrollContainer}>
+        <View style={styles.logoContainer}>
+          <Text style={styles.logo}>RYUS</Text>
+          <Text style={styles.subtitle}>نظام إدارة المخزون</Text>
+        </View>
+
+        <View style={styles.formContainer}>
+          <Text style={styles.title}>
+            {isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
+          </Text>
+          
+          {isRegistering && (
+            <>
+              <TextInput
+                style={styles.input}
+                placeholder="الاسم الكامل"
+                value={fullName}
+                onChangeText={setFullName}
+                autoCapitalize="words"
+              />
+              
+              <TextInput
+                style={styles.input}
+                placeholder="اسم المستخدم"
+                value={username}
+                onChangeText={setUsername}
+                autoCapitalize="none"
+              />
+              
+              <TextInput
+                style={styles.input}
+                placeholder="البريد الإلكتروني"
+                value={email}
+                onChangeText={setEmail}
+                keyboardType="email-address"
+                autoCapitalize="none"
+              />
+            </>
+          )}
+          
+          {!isRegistering && (
+            <TextInput
+              style={styles.input}
+              placeholder="البريد الإلكتروني أو اسم المستخدم"
+              value={loginIdentifier}
+              onChangeText={setLoginIdentifier}
+              autoCapitalize="none"
+            />
+          )}
+          
+          <View style={styles.passwordContainer}>
+            <TextInput
+              style={styles.passwordInput}
+              placeholder="كلمة المرور"
+              value={password}
+              onChangeText={setPassword}
+              secureTextEntry={!showPassword}
+            />
+            <TouchableOpacity 
+              style={styles.eyeButton}
+              onPress={() => setShowPassword(!showPassword)}
+            >
+              <Ionicons 
+                name={showPassword ? 'eye-off' : 'eye'} 
+                size={24} 
+                color="#666" 
+              />
+            </TouchableOpacity>
+          </View>
+          
+          <TouchableOpacity 
+            style={[styles.button, loading && styles.buttonDisabled]} 
+            onPress={isRegistering ? handleRegister : handleLogin}
+            disabled={loading}
+          >
+            <Text style={styles.buttonText}>
+              {loading 
+                ? (isRegistering ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...') 
+                : (isRegistering ? 'إنشاء حساب' : 'تسجيل الدخول')
+              }
+            </Text>
+          </TouchableOpacity>
+
+          <TouchableOpacity 
+            style={styles.switchButton}
+            onPress={() => setIsRegistering(!isRegistering)}
+          >
+            <Text style={styles.switchButtonText}>
+              {isRegistering 
+                ? 'لديك حساب بالفعل؟ تسجيل الدخول' 
+                : 'ليس لديك حساب؟ إنشاء حساب جديد'
+              }
+            </Text>
+          </TouchableOpacity>
+        </View>
+      </ScrollView>
+    </KeyboardAvoidingView>
   );
 }
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
-    justifyContent: 'center',
-    padding: 20,
     backgroundColor: '#f5f5f5',
   },
+  scrollContainer: {
+    flexGrow: 1,
+    justifyContent: 'center',
+    padding: 20,
+  },
+  logoContainer: {
+    alignItems: 'center',
+    marginBottom: 40,
+  },
+  logo: {
+    fontSize: 48,
+    fontWeight: 'bold',
+    color: '#2563eb',
+    marginBottom: 8,
+  },
+  subtitle: {
+    fontSize: 16,
+    color: '#666',
+    textAlign: 'center',
+  },
+  formContainer: {
+    backgroundColor: 'white',
+    borderRadius: 12,
+    padding: 24,
+    shadowColor: '#000',
+    shadowOffset: { width: 0, height: 2 },
+    shadowOpacity: 0.1,
+    shadowRadius: 8,
+    elevation: 4,
+  },
   title: {
-    fontSize: 24,
+    fontSize: 20,
     fontWeight: 'bold',
-    textAlign: 'center',
-    marginBottom: 30,
+    color: '#1f2937',
+    marginBottom: 24,
+    textAlign: 'center',
   },
   input: {
-    borderWidth: 1,
-    borderColor: '#ddd',
-    padding: 15,
-    marginBottom: 15,
-    borderRadius: 8,
+    borderWidth: 1.5,
+    borderColor: '#e5e7eb',
+    borderRadius: 8,
+    padding: 16,
+    fontSize: 16,
+    marginBottom: 16,
     backgroundColor: 'white',
+    textAlign: 'right',
+  },
+  passwordContainer: {
+    flexDirection: 'row',
+    alignItems: 'center',
+    borderWidth: 1.5,
+    borderColor: '#e5e7eb',
+    borderRadius: 8,
+    backgroundColor: 'white',
+    marginBottom: 16,
+  },
+  passwordInput: {
+    flex: 1,
+    padding: 16,
+    fontSize: 16,
+    textAlign: 'right',
+  },
+  eyeButton: {
+    padding: 16,
   },
   button: {
-    backgroundColor: '#007AFF',
-    padding: 15,
-    borderRadius: 8,
+    backgroundColor: '#2563eb',
+    borderRadius: 8,
+    padding: 16,
+    marginTop: 8,
   },
   buttonDisabled: {
-    backgroundColor: '#ccc',
+    backgroundColor: '#9ca3af',
   },
   buttonText: {
     color: 'white',
-    textAlign: 'center',
     fontSize: 16,
     fontWeight: 'bold',
+    textAlign: 'center',
+  },
+  switchButton: {
+    marginTop: 16,
+    padding: 8,
+  },
+  switchButtonText: {
+    color: '#2563eb',
+    textAlign: 'center',
+    fontSize: 14,
   },
 });