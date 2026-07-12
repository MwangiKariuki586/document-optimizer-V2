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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_requests: {
        Row: {
          action: string
          completed_at: string | null
          created_at: string
          document_id: string
          error_message: string | null
          estimated_cost: number | null
          id: string
          input_summary: string | null
          input_tokens: number | null
          model: string | null
          output: Json | null
          output_tokens: number | null
          provider: string | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          completed_at?: string | null
          created_at?: string
          document_id: string
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          input_summary?: string | null
          input_tokens?: number | null
          model?: string | null
          output?: Json | null
          output_tokens?: number | null
          provider?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action?: string
          completed_at?: string | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          input_summary?: string | null
          input_tokens?: number | null
          model?: string | null
          output?: Json | null
          output_tokens?: number | null
          provider?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content_markdown: string | null
          created_at: string
          document_id: string
          editor_json: Json | null
          formatting_metadata: Json
          id: string
          ingestion_id: string | null
          notes: string | null
          source: string
          title: string
          user_id: string
          version_number: number
        }
        Insert: {
          content_markdown?: string | null
          created_at?: string
          document_id: string
          editor_json?: Json | null
          formatting_metadata?: Json
          id?: string
          ingestion_id?: string | null
          notes?: string | null
          source: string
          title: string
          user_id: string
          version_number?: number
        }
        Update: {
          content_markdown?: string | null
          created_at?: string
          document_id?: string
          editor_json?: Json | null
          formatting_metadata?: Json
          id?: string
          ingestion_id?: string | null
          notes?: string | null
          source?: string
          title?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_snapshot_sessions: {
        Row: {
          base_content_hash: string
          closed_at: string | null
          created_at: string
          document_id: string
          expires_at: string
          id: string
          last_content_hash: string
          scope: string
          scope_id: string
          source: string
          updated_at: string
          user_id: string
          version_id: string
        }
        Insert: {
          base_content_hash: string
          closed_at?: string | null
          created_at?: string
          document_id: string
          expires_at?: string
          id?: string
          last_content_hash: string
          scope: string
          scope_id: string
          source: string
          updated_at?: string
          user_id: string
          version_id: string
        }
        Update: {
          base_content_hash?: string
          closed_at?: string | null
          created_at?: string
          document_id?: string
          expires_at?: string
          id?: string
          last_content_hash?: string
          scope?: string
          scope_id?: string
          source?: string
          updated_at?: string
          user_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_snapshot_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_snapshot_sessions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          current_markdown: string | null
          editor_json: Json | null
          extracted_text: string | null
          fidelity_status: string
          file_type: string
          formatting_metadata: Json
          id: string
          original_file_key: string | null
          original_file_name: string | null
          original_file_size: number | null
          original_mime_type: string | null
          file_checksum: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          created_at?: string
          current_markdown?: string | null
          editor_json?: Json | null
          extracted_text?: string | null
          fidelity_status?: string
          file_type?: string
          formatting_metadata?: Json
          id?: string
          original_file_key?: string | null
          original_file_name?: string | null
          original_file_size?: number | null
          original_mime_type?: string | null
          file_checksum?: string | null
          source_type: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          word_count?: number
        }
        Update: {
          created_at?: string
          current_markdown?: string | null
          editor_json?: Json | null
          extracted_text?: string | null
          fidelity_status?: string
          file_type?: string
          formatting_metadata?: Json
          id?: string
          original_file_key?: string | null
          original_file_name?: string | null
          original_file_size?: number | null
          original_mime_type?: string | null
          file_checksum?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      document_ingestions: {
        Row: {
          attempt_count: number
          client_checksum: string
          completed_at: string | null
          created_at: string
          declared_mime_type: string
          detected_mime_type: string | null
          document_id: string | null
          duplicate_document_id: string | null
          duplicate_resolution: string
          error_code: string | null
          error_message: string | null
          file_size: number
          file_type: string
          heartbeat_at: string | null
          id: string
          idempotency_key: string
          metrics: Json
          original_file_name: string
          processing_started_at: string | null
          queue_message_id: number | null
          stage: string
          status: string
          storage_key: string | null
          updated_at: string
          upload_completed_at: string | null
          user_id: string
          verified_checksum: string | null
        }
        Insert: {
          attempt_count?: number
          client_checksum: string
          completed_at?: string | null
          created_at?: string
          declared_mime_type: string
          detected_mime_type?: string | null
          document_id?: string | null
          duplicate_document_id?: string | null
          duplicate_resolution?: string
          error_code?: string | null
          error_message?: string | null
          file_size: number
          file_type: string
          heartbeat_at?: string | null
          id?: string
          idempotency_key: string
          metrics?: Json
          original_file_name: string
          processing_started_at?: string | null
          queue_message_id?: number | null
          stage?: string
          status?: string
          storage_key?: string | null
          updated_at?: string
          upload_completed_at?: string | null
          user_id: string
          verified_checksum?: string | null
        }
        Update: {
          attempt_count?: number
          client_checksum?: string
          completed_at?: string | null
          declared_mime_type?: string
          detected_mime_type?: string | null
          document_id?: string | null
          duplicate_document_id?: string | null
          duplicate_resolution?: string
          error_code?: string | null
          error_message?: string | null
          file_size?: number
          file_type?: string
          heartbeat_at?: string | null
          id?: string
          idempotency_key?: string
          metrics?: Json
          original_file_name?: string
          processing_started_at?: string | null
          queue_message_id?: number | null
          stage?: string
          status?: string
          storage_key?: string | null
          updated_at?: string
          upload_completed_at?: string | null
          user_id?: string
          verified_checksum?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_ingestions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_ingestions_duplicate_document_id_fkey"
            columns: ["duplicate_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          document_id: string
          file_key: string | null
          format: string
          id: string
          status: string
          user_id: string
          warning: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          file_key?: string | null
          format: string
          id?: string
          status?: string
          user_id: string
          warning?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          file_key?: string | null
          format?: string
          id?: string
          status?: string
          user_id?: string
          warning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clerk_id: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clerk_id: string
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clerk_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_counters: {
        Row: {
          created_at: string
          request_count: number
          rule_key: string
          subject_key: string
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          request_count?: number
          rule_key: string
          subject_key: string
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          request_count?: number
          rule_key?: string
          subject_key?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          created_at: string
          id: number
          rule_key: string
          subject_key: string
        }
        Insert: {
          created_at?: string
          id?: number
          rule_key: string
          subject_key: string
        }
        Update: {
          created_at?: string
          id?: number
          rule_key?: string
          subject_key?: string
        }
        Relationships: []
      }
      suggestion_preview_selections: {
        Row: {
          consumed_at: string | null
          created_at: string
          document_id: string
          expires_at: string
          id: string
          suggestion_ids: string[]
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          document_id: string
          expires_at?: string
          id?: string
          suggestion_ids: string[]
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          document_id?: string
          expires_at?: string
          id?: string
          suggestion_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_preview_selections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          ai_request_id: string | null
          created_at: string
          document_id: string
          explanation: string | null
          id: string
          original_text: string
          status: string
          suggested_text: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_request_id?: string | null
          created_at?: string
          document_id: string
          explanation?: string | null
          id?: string
          original_text: string
          status?: string
          suggested_text: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_request_id?: string | null
          created_at?: string
          document_id?: string
          explanation?: string | null
          id?: string
          original_text?: string
          status?: string
          suggested_text?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_ai_request_id_fkey"
            columns: ["ai_request_id"]
            isOneToOne: false
            referencedRelation: "ai_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_ledger: {
        Row: {
          created_at: string
          document_id: string | null
          estimated_cost: number | null
          event_type: string
          id: string
          ingestion_id: string | null
          input_tokens: number | null
          metadata: Json
          model: string | null
          output_tokens: number | null
          provider: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          estimated_cost?: number | null
          event_type: string
          id?: string
          ingestion_id?: string | null
          input_tokens?: number | null
          metadata?: Json
          model?: string | null
          output_tokens?: number | null
          provider?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          estimated_cost?: number | null
          event_type?: string
          id?: string
          ingestion_id?: string | null
          input_tokens?: number | null
          metadata?: Json
          model?: string | null
          output_tokens?: number | null
          provider?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_ledger_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          checklist_dismissed_at: string | null
          completed_at: string | null
          created_at: string
          dismissed_tips: string[]
          onboarding_version: number
          replay_started_at: string | null
          updated_at: string
          user_id: string
          welcome_dismissed_at: string | null
        }
        Insert: {
          checklist_dismissed_at?: string | null
          completed_at?: string | null
          created_at?: string
          dismissed_tips?: string[]
          onboarding_version?: number
          replay_started_at?: string | null
          updated_at?: string
          user_id: string
          welcome_dismissed_at?: string | null
        }
        Update: {
          checklist_dismissed_at?: string | null
          completed_at?: string | null
          created_at?: string
          dismissed_tips?: string[]
          onboarding_version?: number
          replay_started_at?: string | null
          updated_at?: string
          user_id?: string
          welcome_dismissed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_document_ingestion_message: {
        Args: { p_message_id: number }
        Returns: boolean
      }
      create_paste_document_atomic: {
        Args: {
          p_content: string
          p_editor_json: Json
          p_title: string
          p_user_id: string
          p_word_count: number
        }
        Returns: { document_id: string; document_title: string }[]
      }
      consume_rate_limit: {
        Args: {
          p_max_count: number
          p_rule_key: string
          p_subject_key: string
          p_window_seconds: number
        }
        Returns: {
          allowed: boolean
          limit_count: number
          remaining: number
          reset_at: string
        }[]
      }
      enqueue_document_ingestion: {
        Args: { p_delay_seconds?: number; p_ingestion_id: string }
        Returns: number
      }
      finalize_document_ingestion: {
        Args: {
          p_current_markdown: string
          p_detected_mime_type: string
          p_editor_json: Json
          p_extracted_text: string
          p_fidelity_status: string
          p_formatting_metadata: Json
          p_ingestion_id: string
          p_metrics?: Json
          p_verified_checksum: string
          p_word_count: number
        }
        Returns: { existing_document_id: string | null; result_status: string }[]
      }
      read_document_ingestion_queue: {
        Args: { p_quantity?: number; p_visibility_timeout?: number }
        Returns: {
          enqueued_at: string
          message: Json
          message_id: number
          read_count: number
          visible_at: string
        }[]
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
