@@ .. @@
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { supabase } from '../lib/supabase';
 
+// تعريف أنواع البيانات
 interface User {
   id: string;
   email: string;
   full_name?: string;
+  username?: string;
+  role?: string;
+  status?: string;
+  defaultPage?: string;
+  roles?: string[];
+  user_id?: string;
 }
 
+interface UserRole {
+  role_id: string;
+  roles: {
+    id: string;
+    name: string;
+    display_name: string;
+    hierarchy_level: number;
+  };
+}
+
+interface Permission {
+  id: string;
+  name: string;
+  display_name: string;
+  category: string;
+}
+
+interface ProductPermissions {
+  [key: string]: {
+    allowed_items: string[];
+    has_full_access: boolean;
+  };
+}
+
 interface AuthContextType {
   user: User | null;
   loading: boolean;
+  allUsers: User[];
+  pendingRegistrations: User[];
+  userRoles: UserRole[];
+  userPermissions: Permission[];
+  productPermissions: ProductPermissions;
   login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
+  loginWithUsername: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
+  register: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
   logout: () => Promise<void>;
+  hasPermission: (permission: string) => boolean;
+  hasRole: (role: string) => boolean;
+  isAdmin: boolean;
+  filterProductsByPermissions: (products: any[]) => any[];
+  refreshUserData: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
@@ .. @@
 export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
+  const [allUsers, setAllUsers] = useState<User[]>([]);
+  const [pendingRegistrations, setPendingRegistrations] = useState<User[]>([]);
+  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
+  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
+  const [productPermissions, setProductPermissions] = useState<ProductPermissions>({});
+
+  // جلب بيانات المستخدم الكاملة
+  const fetchUserProfile = useCallback(async (supabaseUser: any) => {
+    if (!supabaseUser) return null;
+    
+    try {
+      const { data: profile, error } = await supabase
+        .from('profiles')
+        .select(`
+          *,
+          user_roles!user_roles_user_id_fkey!inner(
+            roles(
+              name,
+              display_name,
+              hierarchy_level
+            )
+          )
+        `)
+        .eq('user_id', supabaseUser.id)
+        .eq('user_roles.is_active', true)
+        .maybeSingle();
+
+      if (error) {
+        console.error('Error fetching user profile:', error);
+        return null;
+      }
+
+      if (!profile) {
+        return { ...supabaseUser, is_new: true, status: 'pending' };
+      }
+
+      const roles = profile.user_roles?.map((ur: any) => ur.roles.name) || [];
+      
+      return { 
+        ...supabaseUser, 
+        ...profile,
+        roles,
+        id: supabaseUser.id,
+        user_id: supabaseUser.id
+      };
+    } catch (error) {
+      console.error('Profile fetch failed:', error);
+      return null;
+    }
+  }, []);
+
+  // جلب صلاحيات المستخدم
+  const fetchUserPermissions = useCallback(async (userId: string) => {
+    try {
+      // جلب أدوار المستخدم
+      const { data: roles, error: rolesError } = await supabase
+        .from('user_roles')
+        .select(`
+          role_id,
+          roles (
+            id,
+            name,
+            display_name,
+            hierarchy_level
+          )
+        `)
+        .eq('user_id', userId)
+        .eq('is_active', true);
+
+      if (rolesError) throw rolesError;
+
+      // جلب صلاحيات المستخدم عبر الأدوار
+      const roleIds = roles?.map((ur: any) => ur.role_id) || [];
+      let permissions: Permission[] = [];
+
+      if (roleIds.length > 0) {
+        const { data: perms, error: permsError } = await supabase
+          .from('role_permissions')
+          .select(`
+            permissions (
+              id,
+              name,
+              display_name,
+              category
+            )
+          `)
+          .in('role_id', roleIds);
+
+        if (permsError) throw permsError;
+        permissions = perms?.map((rp: any) => rp.permissions) || [];
+      }
+
+      // جلب صلاحيات المنتجات
+      const { data: productPerms, error: productPermsError } = await supabase
+        .from('user_product_permissions')
+        .select('*')
+        .eq('user_id', userId);
+
+      if (productPermsError) throw productPermsError;
+
+      // تنظيم صلاحيات المنتجات
+      const productPermissionsMap: ProductPermissions = {};
+      productPerms?.forEach((perm: any) => {
+        productPermissionsMap[perm.permission_type] = {
+          allowed_items: perm.allowed_items || [],
+          has_full_access: perm.has_full_access || false
+        };
+      });
+
+      setUserRoles(roles || []);
+      setUserPermissions(permissions || []);
+      setProductPermissions(productPermissionsMap);
+    } catch (error) {
+      console.error('خطأ في جلب صلاحيات المستخدم:', error);
+    }
+  }, []);
 
   useEffect(() => {
     // التحقق من الجلسة المحفوظة
@@ .. @@
       const { data: { session } } = await supabase.auth.getSession();
       
       if (session?.user) {
-        setUser({
-          id: session.user.id,
-          email: session.user.email || '',
-          full_name: session.user.user_metadata?.full_name,
-        });
+        const profile = await fetchUserProfile(session.user);
+        if (profile?.status === 'active') {
+          setUser(profile);
+          await fetchUserPermissions(profile.user_id);
+        }
       }
       
       setLoading(false);
@@ .. @@
     // الاستماع لتغييرات المصادقة
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
-      async (event, session) => {
+      async (event, session) => {        
         if (session?.user) {
-          setUser({
-            id: session.user.id,
-            email: session.user.email || '',
-            full_name: session.user.user_metadata?.full_name,
-          });
+          const profile = await fetchUserProfile(session.user);
+          if (profile?.status === 'active') {
+            setUser(profile);
+            await fetchUserPermissions(profile.user_id);
+          } else {
+            setUser(null);
+          }
         } else {
           setUser(null);
+          setUserRoles([]);
+          setUserPermissions([]);
+          setProductPermissions({});
         }
         setLoading(false);
       }
@@ .. @@
     return () => subscription.unsubscribe();
-  }, []);
+  }, [fetchUserProfile, fetchUserPermissions]);
 
   const login = async (email: string, password: string) => {
     try {
@@ .. @@
       if (error) {
         return { success: false, error: error.message };
       }
+
+      const profile = await fetchUserProfile(data.user);
+      if (profile?.status !== 'active') {
+        await supabase.auth.signOut();
+        return { success: false, error: 'حسابك غير نشط. يرجى مراجعة المدير.' };
+      }
       
       return { success: true };
     } catch (error) {
@@ -134,6 +268,52 @@ export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ childre
     }
   };
 
+  const loginWithUsername = async (username: string, password: string) => {
+    try {
+      // استخدام دالة المصادقة الذكية
+      const { data: authResult, error: authError } = await supabase
+        .rpc('auth_with_username', { 
+          username_input: username, 
+          password_input: password 
+        });
+      
+      if (authError || !authResult || authResult.length === 0) {
+        return { success: false, error: 'اسم المستخدم غير صحيح أو غير موجود.' };
+      }
+      
+      const result = authResult[0];
+      if (!result.success) {
+        return { success: false, error: result.error_message || 'خطأ في التحقق من اسم المستخدم.' };
+      }
+
+      return await login(result.user_email, password);
+    } catch (error) {
+      return { success: false, error: 'حدث خطأ غير متوقع.' };
+    }
+  };
+
+  const register = async (fullName: string, username: string, email: string, password: string) => {
+    try {
+      // التحقق من وجود اسم المستخدم
+      const { data: usernameExists, error: usernameCheckError } = await supabase
+        .rpc('username_exists', { p_username: username });
+      
+      if (usernameCheckError) {
+        return { success: false, error: "حدث خطأ أثناء التحقق من اسم المستخدم." };
+      }
+      if (usernameExists) {
+        return { success: false, error: 'اسم المستخدم هذا موجود بالفعل.' };
+      }
+
+      const { error } = await supabase.auth.signUp({
+        email,
+        password,
+        options: {
+          data: { full_name: fullName, username: username }
+        }
+      });
+
+      if (error) {
+        if (error.message.includes('unique constraint')) {
+          return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل.' };
+        }
+        return { success: false, error: error.message };
+      }
+
+      return { success: true };
+    } catch (error) {
+      return { success: false, error: 'حدث خطأ غير متوقع.' };
+    }
+  };
+
   const logout = async () => {
     await supabase.auth.signOut();
     await AsyncStorage.removeItem('user');
+    setUser(null);
+    setUserRoles([]);
+    setUserPermissions([]);
+    setProductPermissions({});
   };
 
+  // دوال الصلاحيات
+  const hasPermission = useCallback((permissionName: string) => {
+    if (!user || !userPermissions) return false;
+    
+    // Super admin and admin have all permissions
+    if (user.role === 'super_admin' || user.role === 'admin') {
+      return true;
+    }
+    
+    return userPermissions.some(perm => perm.name === permissionName);
+  }, [user, userPermissions]);
+
+  const hasRole = useCallback((roleName: string) => {
+    return userRoles.some(ur => ur.roles.name === roleName);
+  }, [userRoles]);
+
+  const isAdmin = useMemo(() => hasRole('super_admin') || hasRole('admin'), [hasRole]);
+
+  // فلترة المنتجات حسب الصلاحيات
+  const filterProductsByPermissions = useCallback((products: any[]) => {
+    if (!products) return [];
+    if (isAdmin) return products;
+
+    // إذا لم تكن هناك صلاحيات محددة، اعرض جميع المنتجات
+    if (!productPermissions || Object.keys(productPermissions).length === 0) {
+      return products;
+    }
+
+    // تطبيق فلترة المنتجات (مبسطة للآن)
+    return products.filter(product => {
+      // يمكن إضافة منطق الفلترة المعقد هنا لاحقاً
+      return true;
+    });
+  }, [isAdmin, productPermissions]);
+
+  const refreshUserData = async () => {
+    if (user) {
+      await fetchUserPermissions(user.user_id);
+    }
+  };
+
   const value: AuthContextType = {
     user,
     loading,
+    allUsers,
+    pendingRegistrations,
+    userRoles,
+    userPermissions,
+    productPermissions,
     login,
+    loginWithUsername,
+    register,
     logout,
+    hasPermission,
+    hasRole,
+    isAdmin,
+    filterProductsByPermissions,
+    refreshUserData,
   };