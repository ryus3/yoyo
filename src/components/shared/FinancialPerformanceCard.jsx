import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  TrendingUp, 
  ShoppingCart, 
  Calculator,
  Users,
  Receipt,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const FinancialPerformanceCard = ({ 
  unifiedProfitData, 
  selectedTimePeriod, 
  onTimePeriodChange 
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const periodLabels = {
    all: 'كل الفترات',
    today: 'اليوم',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    year: 'هذا العام'
  };

  const financialMetrics = [
    {
      id: 'revenue',
      title: 'المبيعات',
      value: (unifiedProfitData?.totalRevenue || 0) - (unifiedProfitData?.deliveryFees || 0),
      icon: Receipt,
      color: '#00d4aa',
      gradientFrom: '#00d4aa',
      gradientTo: '#00b894',
      description: 'إجمالي المبيعات بدون رسوم التوصيل'
    },
    {
      id: 'cogs',
      title: 'تكلفة البضاعة',
      value: unifiedProfitData?.cogs || 0,
      icon: ShoppingCart,
      color: '#ff6b35',
      gradientFrom: '#ff6b35',
      gradientTo: '#e55a2b',
      description: 'تكلفة البضائع المباعة'
    },
    {
      id: 'expenses',
      title: 'المصاريف العامة',
      value: unifiedProfitData?.generalExpenses || 0,
      icon: TrendingUp,
      color: '#e74c3c',
      gradientFrom: '#e74c3c',
      gradientTo: '#c0392b',
      description: 'المصاريف التشغيلية والإدارية'
    },
    {
      id: 'dues',
      title: 'مستحقات مدفوعة',
      value: unifiedProfitData?.employeeSettledDues || 0,
      icon: Users,
      color: '#9b59b6',
      gradientFrom: '#9b59b6',
      gradientTo: '#8e44ad',
      description: 'مستحقات الموظفين المدفوعة'
    },
    {
      id: 'profit',
      title: 'صافي الربح',
      value: unifiedProfitData?.netProfit || 0,
      icon: Calculator,
      color: '#3498db',
      gradientFrom: '#3498db',
      gradientTo: '#2980b9',
      description: 'الربح النهائي بعد خصم التكاليف'
    }
  ];

  // إنشاء بيانات منفصلة لكل عمود - بترتيب عكسي ليتطابق مع الكروت
  const chartData = [
    {
      name: financialMetrics[4].title, // صافي الربح (أزرق)
      value: financialMetrics[4].value,
      id: financialMetrics[4].id,
      color: financialMetrics[4].color
    },
    {
      name: financialMetrics[3].title, // مستحقات مدفوعة (بنفسجي)
      value: financialMetrics[3].value,
      id: financialMetrics[3].id,
      color: financialMetrics[3].color
    },
    {
      name: financialMetrics[2].title, // المصاريف العامة (أحمر)
      value: financialMetrics[2].value,
      id: financialMetrics[2].id,
      color: financialMetrics[2].color
    },
    {
      name: financialMetrics[1].title, // تكلفة البضاعة (برتقالي)
      value: financialMetrics[1].value,
      id: financialMetrics[1].id,
      color: financialMetrics[1].color
    },
    {
      name: financialMetrics[0].title, // المبيعات (أخضر)
      value: financialMetrics[0].value,
      id: financialMetrics[0].id,
      color: financialMetrics[0].color
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const metric = financialMetrics.find(m => m.id === data.id);
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 min-w-48">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric?.color }}
            />
            <p className="font-semibold text-sm">{metric?.title}</p>
          </div>
          <p className="text-xl font-bold mb-1" style={{ color: metric?.color }}>
            {payload[0].value.toLocaleString()} د.ع
          </p>
          <p className="text-xs text-muted-foreground">
            {metric?.description}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}م`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}ك`;
    }
    return amount.toLocaleString();
  };

  return (
    <Card className="bg-background border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">ملخص الأداء المالي</h3>
              <p className="text-sm text-muted-foreground">نظرة بيانية شاملة على الوضع المالي</p>
            </div>
          </div>
          
          {/* فلتر فترات متناسق مع ثيم الكرت */}
          <div className="relative">
            <select 
              value={selectedTimePeriod} 
              onChange={(e) => {
                const period = e.target.value;
                onTimePeriodChange(period);
                localStorage.setItem('financialTimePeriod', period);
              }}
              className="appearance-none bg-background/90 border border-border/50 rounded-lg px-4 py-2 pr-10 text-sm text-foreground font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:border-border transition-all duration-200 cursor-pointer shadow-sm"
            >
              {Object.entries(periodLabels).map(([key, label]) => (
                <option key={key} value={key} className="bg-background text-foreground">{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* الكروت الجميلة فوق الأعمدة مباشرة - مرتبة من اليمين لليسار */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
            {financialMetrics.map((metric) => {
              const Icon = metric.icon;
              
              return (
                <div
                  key={metric.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredCard(metric.id);
                    setHoveredBar(metric.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredCard(null);
                    setHoveredBar(null);
                  }}
                >
                  {/* الكرت الملون بتدرج */}
                  <div 
                    className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${metric.gradientFrom} 0%, ${metric.gradientTo} 100%)`
                    }}
                  >
                    {/* الأيقونة */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="text-right flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white/90 mb-1">{metric.title}</h4>
                      </div>
                      <div className="bg-white/20 rounded-lg p-1.5 sm:p-2">
                        <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    
                    {/* القيمة الرئيسية */}
                    <div className="text-center">
                      <p className="text-sm sm:text-lg font-bold text-white mb-1">
                        {formatCurrency(metric.value)}
                      </p>
                      <p className="text-xs text-white/70">د.ع</p>
                    </div>

                    {/* تأثير الإضاءة */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, white 0%, transparent 70%)'
                      }}
                    />
                  </div>

                  {/* مؤشر اتصال بالعمود */}
                  <div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-background"
                    style={{ backgroundColor: metric.color }}
                  />

                  {/* Tooltip للكرت */}
                  {hoveredCard === metric.id && (
                    <div className="absolute -top-16 sm:-top-20 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 sm:p-3 shadow-xl z-50 min-w-32 sm:min-w-48 animate-in fade-in-0 zoom-in-95 duration-200">
                      <p className="text-xs sm:text-sm text-center text-foreground font-medium mb-1">
                        {metric.title}
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {metric.description}
                      </p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* المخطط البياني - محاذاة الأعمدة مع الكروت */}
          <div className="h-40 bg-muted/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                barCategoryGap="5%"
              >
                <XAxis hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                
                <Bar 
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={120}
                  onMouseEnter={(data, index) => {
                    setHoveredBar(chartData[index]?.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredBar(null);
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={hoveredBar === entry.id ? entry.color : 'transparent'}
                      strokeWidth={hoveredBar === entry.id ? 3 : 0}
                      style={{
                        filter: hoveredBar === entry.id ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                        opacity: hoveredBar === entry.id ? 1 : 0.85
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مؤشر المبيعات الإجمالية */}
        <div className="text-center pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            إجمالي مبيعات الفترة بدون رسوم التوصيل
          </p>
          <p className="text-lg font-bold text-emerald-500">
            {((unifiedProfitData?.totalRevenue || 0) - (unifiedProfitData?.deliveryFees || 0)).toLocaleString()} د.ع
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialPerformanceCard;