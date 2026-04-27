import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class FinancesService {
  constructor(private supabase: SupabaseService) {}

  async addTransaction(userId: string, data: any) {
    const { data: transaction, error } = await this.supabase.getClient()
      .from('financial_transactions')
      .insert({ user_id: userId, ...data })
      .select()
      .single();

    if (error) throw error;

    // Trigger async update of summary
    this.updateMonthlySummary(userId, new Date(data.transaction_date || new Date()));
    this.checkBudgetLimit(userId, data.category);

    return transaction;
  }

  async importCSV(userId: string, csvData: string) {
    // Step 39: MVP CSV Import heuristics
    const rows = csvData.split('\n');
    const transactions = [];

    for (const row of rows.slice(1)) { // Skip header
      const [date, amount, vendor, category] = row.split(',');
      if (!date || !amount) continue;

      transactions.push({
        user_id: userId,
        transaction_date: date,
        amount: parseFloat(amount),
        source_vendor: vendor,
        category: category || 'other',
        transaction_type: parseFloat(amount) > 0 ? 'income' : 'expense'
      });
    }

    const { data, error } = await this.supabase.getClient()
      .from('financial_transactions')
      .insert(transactions)
      .select();

    if (error) throw error;
    return data;
  }

  private async updateMonthlySummary(userId: string, date: Date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];

    const { data: txs } = await this.supabase.getClient()
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', firstDay)
      .lte('transaction_date', new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]);

    if (!txs) return;

    let income = 0;
    let expense = 0;
    const breakdown: Record<string, number> = {};

    txs.forEach(t => {
      const amt = Number(t.amount);
      if (t.transaction_type === 'income') {
        income += amt;
      } else {
        expense += Math.abs(amt);
        breakdown[t.category] = (breakdown[t.category] || 0) + Math.abs(amt);
      }
    });

    await this.supabase.getClient()
      .from('financial_summaries')
      .upsert({
        user_id: userId,
        month_year: firstDay,
        total_income: income,
        total_expenses: expense,
        net_cash_flow: income - expense,
        savings_rate: income > 0 ? ((income - expense) / income) * 100 : 0,
        category_breakdown: breakdown,
        updated_at: new Date()
      }, { onConflict: 'user_id, month_year' });
  }

  private async checkBudgetLimit(userId: string, category: string) {
    const { data: limit } = await this.supabase.getClient()
      .from('budget_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    if (!limit) return;

    // Trigger alert if utilization > 80% (Logic for notification engine)
  }
}
