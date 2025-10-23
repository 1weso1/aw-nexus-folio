export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_bio: string | null
          author_image: string | null
          author_name: string
          category: string | null
          content: string
          created_at: string | null
          excerpt: string
          featured_image: string | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_bio?: string | null
          author_image?: string | null
          author_name?: string
          category?: string | null
          content: string
          created_at?: string | null
          excerpt: string
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_bio?: string | null
          author_image?: string | null
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      blog_seo_metadata: {
        Row: {
          blog_post_id: string
          faq_schema: Json | null
          generated_at: string | null
          id: string
          internal_links: Json | null
          keywords: string[] | null
          meta_description: string
          related_workflow_ids: string[] | null
          seo_title: string
          updated_at: string | null
        }
        Insert: {
          blog_post_id: string
          faq_schema?: Json | null
          generated_at?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          meta_description: string
          related_workflow_ids?: string[] | null
          seo_title: string
          updated_at?: string | null
        }
        Update: {
          blog_post_id?: string
          faq_schema?: Json | null
          generated_at?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          meta_description?: string
          related_workflow_ids?: string[] | null
          seo_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_seo_metadata_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: true
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          window_text: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          window_text: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          window_text?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          to_currency?: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          access_tier: string | null
          automation_challenge: string | null
          can_access_enterprise: boolean | null
          can_access_expert: boolean | null
          company_name: string | null
          company_size: string | null
          created_at: string | null
          download_count: number | null
          download_limit: number | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          interests: string[] | null
          ip_address: unknown
          role: string
          updated_at: string | null
          verification_sent_at: string | null
          verification_token: string | null
        }
        Insert: {
          access_tier?: string | null
          automation_challenge?: string | null
          can_access_enterprise?: boolean | null
          can_access_expert?: boolean | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          download_count?: number | null
          download_limit?: number | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id?: string
          interests?: string[] | null
          ip_address?: unknown
          role: string
          updated_at?: string | null
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Update: {
          access_tier?: string | null
          automation_challenge?: string | null
          can_access_enterprise?: boolean | null
          can_access_expert?: boolean | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          download_count?: number | null
          download_limit?: number | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          interests?: string[] | null
          ip_address?: unknown
          role?: string
          updated_at?: string | null
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          admin_user_id: string | null
          amount: number
          client_email: string
          client_name: string
          created_at: string
          currency: string
          current_uses: number
          description: string
          expires_at: string | null
          id: string
          link_slug: string
          max_uses: number | null
          metadata: Json | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          status: Database["public"]["Enums"]["payment_link_status"]
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          amount: number
          client_email: string
          client_name: string
          created_at?: string
          currency?: string
          current_uses?: number
          description: string
          expires_at?: string | null
          id?: string
          link_slug: string
          max_uses?: number | null
          metadata?: Json | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["payment_link_status"]
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          amount?: number
          client_email?: string
          client_name?: string
          created_at?: string
          currency?: string
          current_uses?: number
          description?: string
          expires_at?: string | null
          id?: string
          link_slug?: string
          max_uses?: number | null
          metadata?: Json | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["payment_link_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          amount_in_egp: number | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          error_message: string | null
          id: string
          paid_at: string | null
          payment_link_id: string
          payment_method: string | null
          paymob_order_id: string | null
          paymob_response: Json | null
          paymob_transaction_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
        }
        Insert: {
          amount: number
          amount_in_egp?: number | null
          created_at?: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          payment_link_id: string
          payment_method?: string | null
          paymob_order_id?: string | null
          paymob_response?: Json | null
          paymob_transaction_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Update: {
          amount?: number
          amount_in_egp?: number | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          payment_link_id?: string
          payment_method?: string | null
          paymob_order_id?: string | null
          paymob_response?: Json | null
          paymob_transaction_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_subscriptions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          last_payment_transaction_id: string | null
          next_payment_date: string | null
          payment_link_id: string
          retry_count: number
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          total_payments_made: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          last_payment_transaction_id?: string | null
          next_payment_date?: string | null
          payment_link_id: string
          retry_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          total_payments_made?: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          last_payment_transaction_id?: string | null
          next_payment_date?: string | null
          payment_link_id?: string
          retry_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          total_payments_made?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_subscriptions_last_payment_transaction_id_fkey"
            columns: ["last_payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_subscriptions_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_collection_items: {
        Row: {
          added_at: string | null
          collection_id: string
          id: string
          workflow_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          id?: string
          workflow_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "workflow_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_collection_items_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_descriptions: {
        Row: {
          description: string
          generated_at: string
          id: string
          setup_guide: string | null
          use_cases: string | null
          workflow_id: string
        }
        Insert: {
          description: string
          generated_at?: string
          id?: string
          setup_guide?: string | null
          use_cases?: string | null
          workflow_id: string
        }
        Update: {
          description?: string
          generated_at?: string
          id?: string
          setup_guide?: string | null
          use_cases?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_descriptions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          ip_address: unknown
          lead_email: string | null
          user_agent: string | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown
          lead_email?: string | null
          user_agent?: string | null
          user_id: string
          workflow_id: string
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown
          lead_email?: string | null
          user_agent?: string | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_email"
            columns: ["lead_email"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "workflow_downloads_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_favorites: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_favorites_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_seo_metadata: {
        Row: {
          faq_schema: Json | null
          generated_at: string | null
          id: string
          keywords: string[] | null
          meta_description: string
          related_blog_post_ids: string[] | null
          schema_data: Json | null
          schema_type: string | null
          seo_title: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          faq_schema?: Json | null
          generated_at?: string | null
          id?: string
          keywords?: string[] | null
          meta_description: string
          related_blog_post_ids?: string[] | null
          schema_data?: Json | null
          schema_type?: string | null
          seo_title: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          faq_schema?: Json | null
          generated_at?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string
          related_blog_post_ids?: string[] | null
          schema_data?: Json | null
          schema_type?: string | null
          seo_title?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_seo_metadata_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tags: {
        Row: {
          tag_id: number
          workflow_id: string
        }
        Insert: {
          tag_id: number
          workflow_id: string
        }
        Update: {
          tag_id?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_tags_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_vectors: {
        Row: {
          created_at: string
          description_text: string
          embedding_deepseek: string | null
          embedding_gemini: string | null
          embedding_model: string | null
          id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          description_text: string
          embedding_deepseek?: string | null
          embedding_gemini?: string | null
          embedding_model?: string | null
          id?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          description_text?: string
          embedding_deepseek?: string | null
          embedding_gemini?: string | null
          embedding_model?: string | null
          id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_vectors_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          category: string | null
          complexity: string | null
          created_at: string | null
          has_credentials: boolean | null
          id: string
          name: string
          node_count: number | null
          path: string
          raw_url: string
          search_tsv: unknown
          size_bytes: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          has_credentials?: boolean | null
          id?: string
          name: string
          node_count?: number | null
          path: string
          raw_url: string
          search_tsv?: unknown
          size_bytes?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          has_credentials?: boolean | null
          id?: string
          name?: string
          node_count?: number | null
          path?: string
          raw_url?: string
          search_tsv?: unknown
          size_bytes?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_download_eligibility: {
        Args: { p_email?: string; p_ip_address?: unknown }
        Returns: {
          access_tier: string
          can_access_enterprise: boolean
          can_access_expert: boolean
          can_download: boolean
          downloads_remaining: number
          downloads_used: number
          message: string
          requires_verification: boolean
        }[]
      }
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      is_site_admin: { Args: never; Returns: boolean }
      match_workflows: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          description_text: string
          similarity: number
          workflow_id: string
        }[]
      }
      match_workflows_deepseek: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          description_text: string
          similarity: number
          workflow_id: string
        }[]
      }
      upsert_workflow: {
        Args: {
          p_category: string
          p_complexity: string
          p_has_credentials: boolean
          p_name: string
          p_node_count: number
          p_path: string
          p_raw_url: string
          p_size: number
          p_slug: string
          p_tags: string[]
          p_updated: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payment_link_status: "active" | "expired" | "completed" | "cancelled"
      payment_type: "one_time" | "monthly"
      subscription_status: "active" | "paused" | "cancelled" | "payment_failed"
      transaction_status: "pending" | "success" | "failed" | "refunded"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      payment_link_status: ["active", "expired", "completed", "cancelled"],
      payment_type: ["one_time", "monthly"],
      subscription_status: ["active", "paused", "cancelled", "payment_failed"],
      transaction_status: ["pending", "success", "failed", "refunded"],
    },
  },
} as const
