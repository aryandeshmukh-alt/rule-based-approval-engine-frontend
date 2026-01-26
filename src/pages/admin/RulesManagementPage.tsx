import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Trash2, Zap, CheckCircle2, XCircle, Users } from 'lucide-react';
import { RequestType, ApprovalRule } from '@/types';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function RulesManagementPage() {
  const { user } = useAuth();
  const { rules, addRule, toggleRule, deleteRule } = useMockData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    requestType: 'leave' as RequestType,
    condition: '',
    action: 'auto_approve' as ApprovalRule['action'],
    priority: 1,
  });

  // Only admins can access
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAddRule = () => {
    if (!newRule.condition.trim()) {
      toast({
        title: 'Invalid rule',
        description: 'Please enter a condition for the rule.',
        variant: 'destructive',
      });
      return;
    }

    addRule({
      ...newRule,
      isActive: true,
    });

    toast({
      title: 'Rule created',
      description: 'The new approval rule has been added successfully.',
    });

    setIsAddDialogOpen(false);
    setNewRule({
      requestType: 'leave',
      condition: '',
      action: 'auto_approve',
      priority: 1,
    });
  };

  const handleDeleteRule = (id: number) => {
    deleteRule(id);
    toast({
      title: 'Rule deleted',
      description: 'The rule has been removed.',
    });
  };

  const getActionIcon = (action: ApprovalRule['action']) => {
    switch (action) {
      case 'auto_approve': return <CheckCircle2 className="h-4 w-4 text-status-approved" />;
      case 'auto_reject': return <XCircle className="h-4 w-4 text-status-rejected" />;
      case 'assign_approver': return <Users className="h-4 w-4 text-status-pending" />;
    }
  };

  const getActionLabel = (action: ApprovalRule['action']) => {
    switch (action) {
      case 'auto_approve': return 'Auto Approve';
      case 'auto_reject': return 'Auto Reject';
      case 'assign_approver': return 'Assign Approver';
    }
  };

  const getActionBadgeVariant = (action: ApprovalRule['action']) => {
    switch (action) {
      case 'auto_approve': return 'bg-status-approved-bg text-status-approved';
      case 'auto_reject': return 'bg-status-rejected-bg text-status-rejected';
      case 'assign_approver': return 'bg-status-pending-bg text-status-pending';
    }
  };

  const rulesByType = {
    leave: rules.filter(r => r.requestType === 'leave'),
    expense: rules.filter(r => r.requestType === 'expense'),
    discount: rules.filter(r => r.requestType === 'discount'),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rules Management</h1>
            <p className="text-muted-foreground mt-1">Configure automatic approval rules</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-sm text-muted-foreground">Total Rules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-status-approved" />
              <p className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-status-approved" />
              <p className="text-2xl font-bold">
                {rules.filter(r => r.action === 'auto_approve').length}
              </p>
              <p className="text-sm text-muted-foreground">Auto-Approve</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-status-rejected" />
              <p className="text-2xl font-bold">
                {rules.filter(r => r.action === 'auto_reject').length}
              </p>
              <p className="text-sm text-muted-foreground">Auto-Reject</p>
            </CardContent>
          </Card>
        </div>

        {/* Rules by Type */}
        {(['leave', 'expense', 'discount'] as RequestType[]).map((type) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  type === 'leave' && 'border-leave text-leave',
                  type === 'expense' && 'border-expense text-expense',
                  type === 'discount' && 'border-discount text-discount',
                )}>
                  {type}
                </Badge>
                Rules
              </CardTitle>
              <CardDescription>
                {rulesByType[type].length} rule{rulesByType[type].length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesByType[type].sort((a, b) => a.priority - b.priority).map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge variant="outline">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {rule.condition}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', getActionBadgeVariant(rule.action))}>
                          {getActionIcon(rule.action)}
                          {getActionLabel(rule.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rulesByType[type].length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No rules configured for {type} requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {/* Add Rule Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Rule</DialogTitle>
              <DialogDescription>
                Create a new automatic approval rule
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select 
                  value={newRule.requestType} 
                  onValueChange={(v) => setNewRule({...newRule, requestType: v as RequestType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Input
                  placeholder="e.g., amount < 1000 AND category = 'Travel'"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like: amount, leave_days, discount_percentage, category, leave_type
                </p>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select 
                  value={newRule.action} 
                  onValueChange={(v) => setNewRule({...newRule, action: v as ApprovalRule['action']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="auto_approve">Auto Approve</SelectItem>
                    <SelectItem value="auto_reject">Auto Reject</SelectItem>
                    <SelectItem value="assign_approver">Assign Approver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  min={1}
                  value={newRule.priority}
                  onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value) || 1})}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers = higher priority. Rules are evaluated in priority order.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>
                Add Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
