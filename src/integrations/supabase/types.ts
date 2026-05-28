export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          phone_number: string | null
          balance: number
          balance_locked: number
          earnings: number
          earnings_locked: number
          level: number
          return_percentage: number
          daily_return_amount: number
          per_mine_return_amount: number
          referral_code: string | null
          referred_by: string | null
          referral_count: number
          is_banned: boolean
          wallet_address: string | null
          mining_ends_at: string | null
          last_mining_at: string | null
          last_mining_reward: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          phone_number?: string | null
          balance?: number
          balance_locked?: number
          earnings?: number
          earnings_locked?: number
          level?: number
          return_percentage?: number
          daily_return_amount?: number
          per_mine_return_amount?: number
          referral_code?: string | null
          referred_by?: string | null
          referral_count?: number
          is_banned?: boolean
          wallet_address?: string | null
          mining_ends_at?: string | null
          last_mining_at?: string | null
          last_mining_reward?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone_number?: string | null
          balance?: number
          balance_locked?: number
          earnings?: number
          earnings_locked?: number
          level?: number
          return_percentage?: number
          daily_return_amount?: number
          per_mine_return_amount?: number
          referral_code?: string | null
          referred_by?: string | null
          referral_count?: number
          is_banned?: boolean
          wallet_address?: string | null
          mining_ends_at?: string | null
          last_mining_at?: string | null
          last_mining_reward?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: string | null
          payment_provider: string | null
          provider_payment_id: string | null
          applied_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          applied_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          applied_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      referral_reward_tiers: {
        Row: {
          investment_amount: number
          level_1_reward: number
          level_2_reward: number
          level_3_reward: number
          level_4_reward: number
          level_5_reward: number
          created_at: string | null
        }
        Insert: {
          investment_amount: number
          level_1_reward: number
          level_2_reward: number
          level_3_reward: number
          level_4_reward: number
          level_5_reward: number
          created_at?: string | null
        }
        Update: {
          investment_amount?: number
          level_1_reward?: number
          level_2_reward?: number
          level_3_reward?: number
          level_4_reward?: number
          level_5_reward?: number
          created_at?: string | null
        }
        Relationships: []
      }
      referral_first_deposit_rewards: {
        Row: {
          id: string
          referrer_profile_id: string
          referee_user_id: string
          deposit_id: string
          deposit_amount: number
          referrer_level: number
          reward_amount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          referrer_profile_id: string
          referee_user_id: string
          deposit_id: string
          deposit_amount: number
          referrer_level: number
          reward_amount: number
          created_at?: string | null
        }
        Update: {
          id?: string
          referrer_profile_id?: string
          referee_user_id?: string
          deposit_id?: string
          deposit_amount?: number
          referrer_level?: number
          reward_amount?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_first_deposit_rewards_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_first_deposit_rewards_referrer_profile_id_fkey"
            columns: ["referrer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ends_at: string
          reward_amount: number
          completed: boolean
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          ends_at: string
          reward_amount: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ends_at?: string
          reward_amount?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mining_rewards: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          mining_session_id: string
          deposit_balance: number
          level: number
          daily_rate_percent: number
          reward_amount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          mining_session_id: string
          deposit_balance: number
          level: number
          daily_rate_percent: number
          reward_amount: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          mining_session_id?: string
          deposit_balance?: number
          level?: number
          daily_rate_percent?: number
          reward_amount?: number
          created_at?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          amount: number
          reserved_amount: number
          fee_amount: number
          net_amount: number
          wallet_address: string
          status: string | null
          source: string
          reservation_released_at: string | null
          approval_due_at: string | null
          approval_note: string | null
          created_at: string | null
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reserved_amount?: number
          fee_amount?: number
          net_amount?: number
          wallet_address: string
          status?: string | null
          source?: string
          reservation_released_at?: string | null
          approval_due_at?: string | null
          approval_note?: string | null
          created_at?: string | null
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reserved_amount?: number
          fee_amount?: number
          net_amount?: number
          wallet_address?: string
          status?: string | null
          source?: string
          reservation_released_at?: string | null
          approval_due_at?: string | null
          approval_note?: string | null
          created_at?: string | null
          processed_at?: string | null
        }
        Relationships: []
      }
      organizer_notifications: {
        Row: {
          id: string
          withdrawal_id: string
          recipient_email: string
          subject: string
          body: string
          status: string
          created_at: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          withdrawal_id: string
          recipient_email: string
          subject: string
          body: string
          status?: string
          created_at?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          withdrawal_id?: string
          recipient_email?: string
          subject?: string
          body?: string
          status?: string
          created_at?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizer_notifications_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          value: string
          created_at: string | null
        }
        Insert: {
          key: string
          value: string
          created_at?: string | null
        }
        Update: {
          key?: string
          value?: string
          created_at?: string | null
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          id: string
          user_id: string
          email: string
          code_hash: string
          expires_at: string
          consumed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          code_hash: string
          expires_at: string
          consumed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          code_hash?: string
          expires_at?: string
          consumed_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          id: string
          profile_id: string
          user_id: string
          amount_delta: number
          balance_before: number
          balance_after: number
          tx_type: string
          reference_table: string | null
          reference_id: string | null
          metadata: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          user_id: string
          amount_delta: number
          balance_before: number
          balance_after: number
          tx_type: string
          reference_table?: string | null
          reference_id?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          user_id?: string
          amount_delta?: number
          balance_before?: number
          balance_after?: number
          tx_type?: string
          reference_table?: string | null
          reference_id?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Relationships: []
      }
      earnings_transactions: {
        Row: {
          id: string
          profile_id: string
          user_id: string
          amount_delta: number
          earnings_before: number
          earnings_after: number
          tx_type: string
          reference_table: string | null
          reference_id: string | null
          metadata: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          user_id: string
          amount_delta: number
          earnings_before: number
          earnings_after: number
          tx_type: string
          reference_table?: string | null
          reference_id?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          user_id?: string
          amount_delta?: number
          earnings_before?: number
          earnings_after?: number
          tx_type?: string
          reference_table?: string | null
          reference_id?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: {
          p_user_id: string
        }
        Returns: void
      }
      get_my_referral_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          referral_code: string | null
          referral_count: number
        }[]
      }
      is_email_taken: {
        Args: {
          candidate: string
        }
        Returns: boolean
      }
      is_phone_taken: {
        Args: {
          candidate: string
        }
        Returns: boolean
      }
      update_my_profile: {
        Args: {
          p_full_name?: string | null
          p_wallet_address?: string | null
        }
        Returns: {
          full_name: string | null
          wallet_address: string | null
          updated_at: string | null
        }[]
      }
      withdraw_request: {
        Args: {
          p_amount: number
          p_source: string
          p_wallet_address: string
        }
        Returns: {
          id: string
          user_id: string
          amount: number
          wallet_address: string
          status: string | null
          source: string
          approval_due_at: string | null
          approval_note: string | null
          created_at: string | null
          processed_at: string | null
          user_email: string | null
        }[]
      }
      get_mining_cooldown_ms: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      compute_daily_rate_from_level: {
        Args: {
          p_level: number
        }
        Returns: number
      }
      start_mining_session: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          started_at: string
          ends_at: string
          reward_amount: number
          level: number
          return_percentage: number
          daily_return_amount: number
          per_mine_return_amount: number
        }[]
      }
      collect_mining_reward: {
        Args: {
          p_session_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
