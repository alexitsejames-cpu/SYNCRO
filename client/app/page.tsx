import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppClient } from "@/components/app/app-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// 1. Import the DB Row Type
import type { Subscription as DBSubscription } from "@/lib/supabase/subscriptions";
export const dynamic = "force-dynamic";
// 2. Define the UI DTO Type (Data Contract)
export interface AppSubscriptionDTO {
    id: number;
    name: string;
    category: string;
    price: number;
    icon: string;
    renews_in: number | null;
    status: string;
    color: string;
    renewal_url: string | null;
    tags: string[];
    date_added: string;
    email_account_id: number | null;
    last_used_at?: string;
    has_api_key: boolean;
    is_trial: boolean;
    trial_ends_at?: string;
    price_after_trial?: number;
    source: string;
    manually_edited: boolean;
    edited_fields: string[];
    pricing_type: string;
    billing_cycle: string;
    cancelled_at?: string;
    active_until?: string;
    paused_at?: string;
    resumes_at?: string;
    price_range?: { min: number; max: number };
    price_history?: Array<{ date: string; amount: number }>;
}

// 3. Replace 'any' with explicit types
function transformSubscription(dbSub: DBSubscription): AppSubscriptionDTO {
    return {
        id: dbSub.id,
        name: dbSub.name,
        category: dbSub.category,
        price: dbSub.price,
        icon: dbSub.icon || "🔗",
        renews_in: dbSub.renews_in,
        status: dbSub.status,
        color: dbSub.color || "#000000",
        renewal_url: dbSub.renewal_url,
        tags: dbSub.tags || [],
        date_added: dbSub.date_added,
        email_account_id: dbSub.email_account_id,
        last_used_at: dbSub.last_used_at,
        has_api_key: dbSub.has_api_key ?? false,
        is_trial: dbSub.is_trial ?? false,
        trial_ends_at: dbSub.trial_ends_at,
        price_after_trial: dbSub.price_after_trial,
        source: dbSub.source || "manual",
        manually_edited: dbSub.manually_edited ?? false,
        edited_fields: dbSub.edited_fields || [],
        pricing_type: dbSub.pricing_type || "fixed",
        billing_cycle: dbSub.billing_cycle || "monthly",
        cancelled_at: dbSub.cancelled_at,
        active_until: dbSub.active_until,
        paused_at: dbSub.paused_at,
        resumes_at: dbSub.resumes_at,
        price_range: dbSub.price_range,
        price_history: dbSub.price_history,
    };
}

async function getInitialData() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            // Not authenticated - return empty data
            return {
                subscriptions: [],
                emailAccounts: [],
                payments: [],
                priceChanges: [],
                consolidationSuggestions: [],
            };
        }

        // Fetch real data from database
        const [subscriptionsResult, emailAccountsResult, paymentsResult] = await Promise.all([
            supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .order("date_added", { ascending: false }),
            supabase.from("email_accounts").select("*").eq("user_id", user.id),
            supabase
                .from("payments")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
        ]);

        const subscriptions = (subscriptionsResult.data as DBSubscription[] | null)?.map(transformSubscription) || [];
        const emailAccounts = emailAccountsResult.data || [];
        const payments = paymentsResult.data || [];

        return {
            subscriptions,
            emailAccounts,
            payments,
            priceChanges: [], // TODO: Fetch from database
            consolidationSuggestions: [], // TODO: Fetch from database
        };
    } catch (error) {
        console.error("Error fetching initial data:", error);
        // Fallback to empty data on error
        return {
            subscriptions: [],
            emailAccounts: [],
            payments: [],
            priceChanges: [],
            consolidationSuggestions: [],
        };
    }
}

export default async function HomePage() {
    const initialData = await getInitialData();

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#F9F6F2] dark:bg-[#1E2A35] flex items-center justify-center">
                    <LoadingSpinner size="lg" darkMode={false} />
                </div>
            }
        >
            <AppClient
                initialSubscriptions={initialData.subscriptions}
                initialEmailAccounts={initialData.emailAccounts}
                initialPayments={initialData.payments}
                initialPriceChanges={initialData.priceChanges}
                initialConsolidationSuggestions={
                    initialData.consolidationSuggestions
                }
            />
        </Suspense>
    );
}
