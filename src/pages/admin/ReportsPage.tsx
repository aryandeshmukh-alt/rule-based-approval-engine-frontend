import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMockData } from '@/hooks/useMockData';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FileText, Clock, CheckCircle2, XCircle, Zap, TrendingUp } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const COLORS = {
  approved: 'hsl(142, 76%, 36%)',
  rejected: 'hsl(0, 84%, 60%)',
  pending: 'hsl(38, 92%, 50%)',
  cancelled: 'hsl(215, 16%, 47%)',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { stats, leaveRequests, expenseRequests, discountRequests, rules } = useMockData();

  // Only admins can access
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const allRequests = [
    ...leaveRequests.map(r => ({ ...r, type: 'leave' })),
    ...expenseRequests.map(r => ({ ...r, type: 'expense' })),
    ...discountRequests.map(r => ({ ...r, type: 'discount' })),
  ];

  // Status distribution data
  const statusData = [
    { name: 'Approved', value: allRequests.filter(r => r.status === 'approved').length, color: COLORS.approved },
    { name: 'Rejected', value: allRequests.filter(r => r.status === 'rejected').length, color: COLORS.rejected },
    { name: 'Pending', value: allRequests.filter(r => r.status === 'pending').length, color: COLORS.pending },
    { name: 'Cancelled', value: allRequests.filter(r => r.status === 'cancelled').length, color: COLORS.cancelled },
  ];

  // Request type distribution
  const typeData = [
    { name: 'Leave', count: leaveRequests.length, auto: leaveRequests.filter(r => r.statusReason?.includes('Auto')).length },
    { name: 'Expense', count: expenseRequests.length, auto: expenseRequests.filter(r => r.statusReason?.includes('Auto')).length },
    { name: 'Discount', count: discountRequests.length, auto: discountRequests.filter(r => r.statusReason?.includes('Auto')).length },
  ];

  // Rule effectiveness
  const activeRules = rules.filter(r => r.isActive).length;
  const totalAutoProcessed = allRequests.filter(r => r.statusReason?.includes('Auto')).length;
  const autoApprovalRate = allRequests.length > 0 
    ? Math.round((totalAutoProcessed / allRequests.length) * 100) 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Insights into approval patterns and rule effectiveness</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingRequests}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Auto-Processed"
            value={`${autoApprovalRate}%`}
            subtitle={`${totalAutoProcessed} requests`}
            icon={Zap}
            variant="success"
          />
          <StatCard
            title="Active Rules"
            value={activeRules}
            subtitle={`${rules.length} total`}
            icon={TrendingUp}
            variant="default"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Request Status Distribution</CardTitle>
              <CardDescription>Breakdown of all requests by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Request Types Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Type</CardTitle>
              <CardDescription>Total vs. auto-processed requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="auto" fill="hsl(var(--status-approved))" name="Auto-processed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Performance Summary</CardTitle>
            <CardDescription>How your approval rules are performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 rounded-lg bg-status-approved-bg text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-status-approved" />
                <p className="text-3xl font-bold text-status-approved">{stats.autoApproved}</p>
                <p className="text-sm text-muted-foreground mt-1">Auto-Approved</p>
                <p className="text-xs text-muted-foreground">
                  by {rules.filter(r => r.action === 'auto_approve' && r.isActive).length} active rules
                </p>
              </div>
              <div className="p-6 rounded-lg bg-status-rejected-bg text-center">
                <XCircle className="h-8 w-8 mx-auto mb-3 text-status-rejected" />
                <p className="text-3xl font-bold text-status-rejected">{stats.autoRejected}</p>
                <p className="text-sm text-muted-foreground mt-1">Auto-Rejected</p>
                <p className="text-xs text-muted-foreground">
                  by {rules.filter(r => r.action === 'auto_reject' && r.isActive).length} active rules
                </p>
              </div>
              <div className="p-6 rounded-lg bg-status-pending-bg text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-status-pending" />
                <p className="text-3xl font-bold text-status-pending">{stats.pendingRequests}</p>
                <p className="text-sm text-muted-foreground mt-1">Manual Review</p>
                <p className="text-xs text-muted-foreground">
                  assigned to approvers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
