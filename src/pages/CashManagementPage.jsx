import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  Calendar,
  PieChart,
  BarChart3
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useCashSources } from '@/hooks/useCashSources';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import CashSourceCard from '@/components/cash/CashSourceCard';
import CashMovementsList from '@/components/cash/CashMovementsList';
import AddCashDialog from '@/components/cash/AddCashDialog';
import AddCashSourceDialog from '@/components/cash/AddCashSourceDialog';
import SystemProfitSummary from '@/components/cash/SystemProfitSummary';
import StatCard from '@/components/dashboard/StatCard';
import { format, startOfMonth, endOfMonth, startOfWeek, startOfDay, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

const CashManagementPage = () => {
  const navigate = useNavigate();
  const {
    cashSources,
    cashMovements,
    loading,
    addCashSource,
    addCashToSource,
    withdrawCashFromSource,
    getMainCashBalance,
    getTotalSourcesBalance,
    getTotalBalance
  } = useCashSources();

  const [selectedSource, setSelectedSource] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'add' | 'withdraw'
  const [showDialog, setShowDialog] = useState(false);
  const [mainCashBalance, setMainCashBalance] = useState(0);
  const [totalSourcesBalance, setTotalSourcesBalance] = useState(0);
  const [enhancedFinancialData, setEnhancedFinancialData] = useState(null);
  const [deleteSource, setDeleteSource] = useState(null);

  // نظام حقيقي لجلب البيانات المالية الصحيحة
  useEffect(() => {
    const fetchRealFinancialData = async () => {
      try {
        // جلب البيانات المالية الحقيقية الصحيحة
        const { data: realData, error } = await supabase.rpc('calculate_real_main_cash_balance');

        if (!error && realData?.[0]) {
          const real = realData[0];
          const mainBalance = Number(real.final_balance || 0);
          
          // تحديث جميع الحالات من البيانات الحقيقية
          setMainCashBalance(mainBalance);
          setEnhancedFinancialData({
            capitalValue: Number(real.capital_amount || 0),
            totalRevenue: Number(real.total_sales || 0),
            totalSales: Number(real.total_sales || 0),
            realSales: Number(real.total_sales || 0),
            deliveryFees: 0, // لا توجد رسوم توصيل في النظام الجديد
            systemProfit: Number(real.net_profit || 0),
            totalExpenses: Number(real.total_expenses || 0),
            totalPurchases: Number(real.total_purchases || 0),
            employeeDuesPaid: Number(real.employee_dues_paid || 0),
            employeeDues: Number(real.employee_dues_paid || 0),
            netProfit: Number(real.net_profit || 0),
            finalBalance: mainBalance,
            // للتوافق مع المكونات الأخرى
            grossProfit: Number(real.total_sales || 0)
          });

          const sourcesBalance = getTotalSourcesBalance();
          setTotalSourcesBalance(sourcesBalance);

          console.log('💰 النظام المالي الحقيقي محدث:', {
            mainBalance: mainBalance.toLocaleString(),
            capital: Number(real.capital_amount || 0).toLocaleString(),
            netProfit: Number(real.net_profit || 0).toLocaleString()
          });
        }
      } catch (error) {
        console.error('❌ خطأ في النظام المالي الحقيقي:', error);
      }
    };
    
    fetchRealFinancialData();
    
    // تحديث كل دقيقة (أقل تكراراً وأكثر كفاءة)
    const interval = setInterval(fetchRealFinancialData, 60000);
    return () => clearInterval(interval);
  }, [getTotalSourcesBalance, cashSources]);

  // تم دمج هذه الدالة في useEffect الموحد أعلاه

  // حذف مصدر نقد مع رسالة تأكيد أنيقة

  const handleDeleteSource = (source) => {
    if (source.name === 'القاصة الرئيسية') {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف القاصة الرئيسية",
        variant: "destructive"
      });
      return;
    }

    if (source.current_balance > 0) {
      toast({
        title: "خطأ", 
        description: "لا يمكن حذف مصدر يحتوي على رصيد. يرجى تفريغ الرصيد أولاً",
        variant: "destructive"
      });
      return;
    }

    setDeleteSource(source);
  };

  const confirmDeleteSource = async () => {
    if (!deleteSource) return;

    try {
      const { error } = await supabase
        .from('cash_sources')
        .update({ is_active: false })
        .eq('id', deleteSource.id);

      if (error) throw error;

      setDeleteSource(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف مصدر النقد"
      });
    } catch (error) {
      console.error('خطأ في حذف مصدر النقد:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف مصدر النقد",
        variant: "destructive"
      });
    }
  };

  // فتح نافذة إضافة أموال
  const handleAddCash = (source) => {
    setSelectedSource(source);
    setDialogType('add');
    setShowDialog(true);
  };

  // فتح نافذة سحب أموال
  const handleWithdrawCash = (source) => {
    setSelectedSource(source);
    setDialogType('withdraw');
    setShowDialog(true);
  };

  // تنفيذ العملية
  const handleConfirmOperation = async (amount, description) => {
    if (!selectedSource) return;

    if (dialogType === 'add') {
      return await addCashToSource(selectedSource.id, amount, description);
    } else {
      return await withdrawCashFromSource(selectedSource.id, amount, description);
    }
  };

  // حساب الإحصائيات
  const today = new Date();
  const todayStart = startOfDay(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);

  const todayMovements = cashMovements.filter(m => 
    new Date(m.created_at) >= todayStart
  );
  const weekMovements = cashMovements.filter(m => 
    new Date(m.created_at) >= weekStart
  );
  const monthMovements = cashMovements.filter(m => 
    new Date(m.created_at) >= monthStart
  );

  const calculateStats = (movements) => {
    const totalIn = movements
      .filter(m => m.movement_type === 'in')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const totalOut = movements
      .filter(m => m.movement_type === 'out')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    return { totalIn, totalOut, net: totalIn - totalOut };
  };

  const todayStats = calculateStats(todayMovements);
  const weekStats = calculateStats(weekMovements);
  const monthStats = calculateStats(monthMovements);

  // إحصائيات المؤشرات الرئيسية - النظام الموحد
  const kpiCards = [
    {
      title: 'القاصة الرئيسية',
      value: mainCashBalance,
      format: 'currency',
      icon: Wallet,
      colors: ['indigo-600', 'purple-600'],
      change: enhancedFinancialData 
        ? `رأس المال: ${enhancedFinancialData.capitalValue.toLocaleString()} + صافي ربح: ${enhancedFinancialData.netProfit.toLocaleString()}` 
        : 'جاري تحميل البيانات الحقيقية...'
    },
    {
      title: 'الرصيد النقدي الفعلي',
      value: mainCashBalance,
      format: 'currency',
      icon: DollarSign,
      colors: ['emerald-600', 'teal-600'],
      change: enhancedFinancialData && enhancedFinancialData.netProfit > 0 
        ? `صافي الربح: ${enhancedFinancialData.netProfit.toLocaleString()}`
        : 'رأس المال فقط'
    },
    {
      title: 'داخل هذا الشهر',
      value: monthStats.totalIn,
      format: 'currency',
      icon: TrendingUp,
      colors: ['teal-500', 'cyan-500'],
      change: `${monthMovements.filter(m => m.movement_type === 'in').length} حركة`
    },
    {
      title: 'خارج هذا الشهر',
      value: monthStats.totalOut,
      format: 'currency',
      icon: TrendingDown,
      colors: ['red-500', 'orange-500'],
      change: `${monthMovements.filter(m => m.movement_type === 'out').length} حركة`
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات القاصة...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>إدارة القاصة - نظام RYUS</title>
        <meta name="description" content="إدارة مصادر النقد وحركات القاصة" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/accounting')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              العودة للمركز المالي
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">إدارة القاصة</h1>
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiCards.map((stat, index) => (
            <StatCard key={`${stat.title}-${index}`} {...stat} />
          ))}
        </div>

        {/* تابات الإدارة */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              مصادر النقد
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              حركات النقد
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          {/* مصادر النقد */}
          <TabsContent value="sources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">مصادر النقد النشطة</h2>
              <AddCashSourceDialog onAdd={addCashSource}>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة مصدر جديد
                </Button>
              </AddCashSourceDialog>
            </div>

            {cashSources.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">لا توجد مصادر نقد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashSources.map((source) => {
                  const sourceMovements = cashMovements.filter(m => m.cash_source_id === source.id);
                  
                  // تحديد الرصيد المناسب لكل مصدر
                  let displayBalance = source.current_balance;
                  if (source.name === 'القاصة الرئيسية') {
                    displayBalance = mainCashBalance;
                  }
                  
                  return (
                    <CashSourceCard
                      key={source.id}
                      cashSource={source}
                      movements={sourceMovements}
                      onAddCash={handleAddCash}
                      onWithdrawCash={handleWithdrawCash}
                      onViewDetails={() => console.log('View details:', source)}
                      onDelete={handleDeleteSource}
                      realBalance={displayBalance}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* حركات النقد */}
          <TabsContent value="movements">
            <CashMovementsList
              movements={cashMovements}
              cashSources={cashSources}
            />
          </TabsContent>

          {/* التحليلات */}
          <TabsContent value="analytics" className="space-y-6">
            {/* الملخص المالي الموحد - النظام الجديد */}
            <SystemProfitSummary
              enhancedData={enhancedFinancialData}
              capitalAmount={enhancedFinancialData?.capitalValue || 0}
              realizedProfits={enhancedFinancialData?.systemProfit || 0}
              totalPurchases={enhancedFinancialData?.totalPurchases || 0}
              totalExpenses={enhancedFinancialData?.totalExpenses || 0}
              inventoryValue={0}
              onFilterChange={(period, dateRange) => {
                // لا حاجة لإعادة جلب - النظام محدث تلقائياً
                console.log('🔄 تغيير الفلتر:', period, dateRange);
              }}
            />
            
            {/* إحصائيات فترية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">داخل:</span>
                      <span className="font-medium">{todayStats.totalIn.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">خارج:</span>
                      <span className="font-medium">{todayStats.totalOut.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span>الصافي:</span>
                      <span className={todayStats.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {todayStats.net.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">هذا الأسبوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">داخل:</span>
                      <span className="font-medium">{weekStats.totalIn.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">خارج:</span>
                      <span className="font-medium">{weekStats.totalOut.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span>الصافي:</span>
                      <span className={weekStats.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {weekStats.net.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">هذا الشهر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">داخل:</span>
                      <span className="font-medium">{monthStats.totalIn.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">خارج:</span>
                      <span className="font-medium">{monthStats.totalOut.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span>الصافي:</span>
                      <span className={monthStats.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {monthStats.net.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* توزيع المصادر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  توزيع الأرصدة حسب المصدر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cashSources.map((source) => {
                    // حساب الأرصدة والنسب بطريقة موحدة وصحيحة
                    const realBalance = source.name === 'القاصة الرئيسية' 
                      ? mainCashBalance 
                      : source.current_balance;
                    const totalBalance = mainCashBalance + getTotalSourcesBalance();
                    const percentage = totalBalance > 0 
                      ? ((realBalance / totalBalance) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <div key={source.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: source.type === 'bank' ? '#3b82f6' : 
                                               source.type === 'digital_wallet' ? '#8b5cf6' : '#10b981'
                            }}
                          />
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-semibold">{realBalance.toLocaleString()} د.ع</span>
                          <span className="text-sm text-muted-foreground ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* نافذة إضافة/سحب الأموال */}
        <AddCashDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          cashSource={selectedSource}
          type={dialogType}
          onConfirm={handleConfirmOperation}
        />

        {/* نافذة تأكيد الحذف */}
        <AlertDialog open={!!deleteSource} onOpenChange={() => setDeleteSource(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف المصدر</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف مصدر النقد "{deleteSource?.name}"؟ 
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteSource}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                حذف المصدر
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default CashManagementPage;