import { useAuth } from '@/contexts/AuthContext';
import { useLeaves } from '@/hooks/useLeaves';
import { useExpenses } from '@/hooks/useExpenses';
import { useDiscounts } from '@/hooks/useDiscounts';
import { useBalances } from '@/hooks/useBalances';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Receipt,
  Percent,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BalanceUsageDialog } from '@/components/balances/BalanceUsageDialog';
import { RequestDetailDialog } from '@/components/dashboard/RequestDetailDialog';

const COLORS = {
  approved: 'hsl(142, 76%, 36%)',
  rejected: 'hsl(0, 84%, 60%)',
  pending: 'hsl(38, 92%, 50%)',
  cancelled: 'hsl(215, 16%, 47%)',
};

const getRequestDetails = (request: any) => {
  if (request.type === 'leave') {
    return `${request.leaveType} • ${format(new Date(request.fromDate), 'MMM d')} - ${format(new Date(request.toDate), 'MMM d, yyyy')}`;
  } else if (request.type === 'expense') {
    return `${request.category} • $${request.amount.toLocaleString()}`;
  } else {
    return `${request.discountPercentage}% discount request`;
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { myLeaves } = useLeaves();
  const { myExpenses } = useExpenses();
  const { myDiscounts } = useDiscounts();
  const { balances: unifiedBalances, isLoading: isLoadingBalances } = useBalances();

  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [usageType, setUsageType] = useState<'leave' | 'expense' | 'discount'>('leave');
  const [usageTitle, setUsageTitle] = useState('');

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const recentRequests = useMemo(() => {
    return [
      ...myLeaves.map(r => ({ ...r, type: 'leave' as const })),
      ...myExpenses.map(r => ({ ...r, type: 'expense' as const })),
      ...myDiscounts.map(r => ({ ...r, type: 'discount' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [myLeaves, myExpenses, myDiscounts]);

  const stats = useMemo(() => {
    const all = [...myLeaves, ...myExpenses, ...myDiscounts];
    return {
      totalRequests: all.length,
      pendingRequests: all.filter(r => r.status === 'pending').length,
      approvedRequests: all.filter(r => r.status === 'approved').length,
      rejectedRequests: all.filter(r => r.status === 'rejected').length,
      cancelledRequests: all.filter(r => r.status === 'cancelled').length,
    };
  }, [myLeaves, myExpenses, myDiscounts]);

  const statusData = useMemo(() => [
    { name: 'Approved', value: stats.approvedRequests, color: COLORS.approved },
    { name: 'Rejected', value: stats.rejectedRequests, color: COLORS.rejected },
    { name: 'Pending', value: stats.pendingRequests, color: COLORS.pending },
    { name: 'Cancelled', value: stats.cancelledRequests, color: COLORS.cancelled },
  ].filter(item => item.value > 0), [stats]);

  const getUsageData = (type: 'leave' | 'expense' | 'discount') => {
    if (type === 'leave') {
      return myLeaves
        .filter(r => r.status === 'approved')
        .map(r => ({
          id: r.id,
          date: r.createdAt,
          description: `${r.leaveType} • ${format(new Date(r.fromDate), 'MMM d')} - ${format(new Date(r.toDate), 'MMM d')}`,
          amount: differenceInDays(new Date(r.toDate), new Date(r.fromDate)) + 1
        }));
    } else if (type === 'expense') {
      return myExpenses
        .filter(r => r.status === 'approved')
        .map(r => ({
          id: r.id,
          date: r.createdAt,
          description: r.category,
          amount: r.amount
        }));
    } else {
      return myDiscounts
        .filter(r => r.status === 'approved')
        .map(r => ({
          id: r.id,
          date: r.createdAt,
          description: 'Benefit Discount',
          amount: r.discountPercentage
        }));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header Block */}
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-black tracking-tight text-foreground letter-spacing-tight">
            Welcome, {user?.name && user.name !== 'employee' ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-muted-foreground font-semibold text-lg">
            You have <span className="text-primary font-bold">{stats.pendingRequests}</span> pending requests requiring attention.
          </p>
        </div>

        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <StatCard title="Total" value={stats.totalRequests} icon={FileText} variant="primary" />
            <StatCard title="Pending" value={stats.pendingRequests} icon={Clock} variant="warning" />
            <StatCard title="Approved" value={stats.approvedRequests} icon={CheckCircle2} variant="success" />
            <StatCard title="Rejected" value={stats.rejectedRequests} icon={XCircle} variant="danger" />
            <StatCard title="Cancelled" value={stats.cancelledRequests} icon={XCircle} variant="default" />
          </div>

          {/* Quick Actions Row - New Position */}
          <div className="bg-muted/30 p-4 rounded-3xl border border-border/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Quick Actions</h3>
                <p className="text-xs text-muted-foreground/60 px-1 font-medium">Submit a new request in seconds</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant="outline" asChild className="rounded-2xl bg-background shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all font-bold px-8">
                  <Link to="/leaves">Apply Leave</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-2xl bg-background shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all font-bold px-8">
                  <Link to="/expenses">Claim Expense</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-2xl bg-background shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all font-bold px-8">
                  <Link to="/discounts">Get Discount</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Recent Activity (LHS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    <CardDescription>Track your latest request statuses</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                    <Link to="/my-requests" className="flex items-center gap-1 font-bold">
                      History <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid gap-3">
                  {recentRequests.map((request) => (
                    <button
                      key={`${request.type}-${request.id}`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setDetailDialogOpen(true);
                      }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-md transition-all group text-left w-full"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${request.type === 'leave' ? 'bg-leave-bg text-leave' :
                          request.type === 'expense' ? 'bg-expense-bg text-expense' : 'bg-discount-bg text-discount'
                          }`}>
                          {request.type === 'leave' && <CalendarDays className="h-5 w-5" />}
                          {request.type === 'expense' && <Receipt className="h-5 w-5" />}
                          {request.type === 'discount' && <Percent className="h-5 w-5" />}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm capitalize group-hover:text-primary transition-colors">
                            {request.type} Request
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                            {getRequestDetails(request)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={request.status} />
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                  {recentRequests.length === 0 && (
                    <div className="text-center py-12 rounded-2xl border-2 border-dashed border-muted">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground font-medium">No activity yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (RHS) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-3xl border-border/40 overflow-hidden shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Insights</CardTitle>
                <CardDescription>Request Distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] -mt-2">
                  {stats.totalRequests > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="45%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={12}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: 'bold' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1.5">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Clock className="h-10 w-10 opacity-20 mb-3" />
                      <p className="text-sm font-bold">Awaiting Activity Data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden text-black">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">My Quotas</CardTitle>
                <CardDescription>Click a bar for history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-6">
                {unifiedBalances?.leaves.map((balance) => (
                  <button
                    key={balance.leaveType}
                    className="w-full text-left group space-y-2.5"
                    onClick={() => {
                      setUsageType('leave');
                      setUsageTitle(`Leaves (${balance.leaveType})`);
                      setUsageDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Leave ({balance.leaveType.toLowerCase()})
                      </span>
                      <span className="text-xs font-black text-foreground bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                        {balance.balance} / {balance.total} days
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${(balance.balance / balance.total) * 100}%` }}
                      />
                    </div>
                  </button>
                ))}

                {unifiedBalances?.expenses && (
                  <button
                    className="w-full text-left group space-y-2.5"
                    onClick={() => {
                      setUsageType('expense');
                      setUsageTitle('Expenses Pool');
                      setUsageDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Expenses
                      </span>
                      <span className="text-xs font-black text-foreground bg-green-50 px-2 py-0.5 rounded text-green-700">
                        ${unifiedBalances.expenses.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-700"
                        style={{ width: `${(unifiedBalances.expenses.remaining / unifiedBalances.expenses.total) * 100}%` }}
                      />
                    </div>
                  </button>
                )}

                {unifiedBalances?.discounts && (
                  <button
                    className="w-full text-left group space-y-2.5"
                    onClick={() => {
                      setUsageType('discount');
                      setUsageTitle('Discount Quota');
                      setUsageDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Discount
                      </span>
                      <span className="text-xs font-black text-foreground bg-purple-50 px-2 py-0.5 rounded text-purple-700">
                        {unifiedBalances.discounts.remaining}% left
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${(unifiedBalances.discounts.remaining / unifiedBalances.discounts.total) * 100}%` }}
                      />
                    </div>
                  </button>
                )}

                {!unifiedBalances && isLoadingBalances && (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-2.5 bg-muted rounded full" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BalanceUsageDialog
        isOpen={usageDialogOpen}
        onClose={() => setUsageDialogOpen(false)}
        title={usageTitle}
        type={usageType}
        usage={getUsageData(usageType)}
      />

      <RequestDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        request={selectedRequest}
      />
    </AppLayout>
  );
}
