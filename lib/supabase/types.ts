export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_requests: {
        Row: {
          action: string;
          completed_at: string | null;
          created_at: string;
          document_id: string;
          error_message: string | null;
          estimated_cost: number | null;
          id: string;
          input_summary: string | null;
          input_tokens: number | null;
          model: string | null;
          output: Json | null;
          output_tokens: number | null;
          provider: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          action: string;
          completed_at?: string | null;
          created_at?: string;
          document_id: string;
          error_message?: string | null;
          estimated_cost?: number | null;
          id?: string;
          input_summary?: string | null;
          input_tokens?: number | null;
          model?: string | null;
          output?: Json | null;
          output_tokens?: number | null;
          provider?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          action?: string;
          completed_at?: string | null;
          created_at?: string;
          document_id?: string;
          error_message?: string | null;
          estimated_cost?: number | null;
          id?: string;
          input_summary?: string | null;
          input_tokens?: number | null;
          model?: string | null;
          output?: Json | null;
          output_tokens?: number | null;
          provider?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_requests_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      document_versions: {
        Row: {
          content_markdown: string | null;
          created_at: string;
          document_id: string;
          editor_json: Json | null;
          formatting_metadata: Json;
          id: string;
          notes: string | null;
          source: string;
          title: string;
          user_id: string;
        };
        Insert: {
          content_markdown?: string | null;
          created_at?: string;
          document_id: string;
          editor_json?: Json | null;
          formatting_metadata?: Json;
          id?: string;
          notes?: string | null;
          source: string;
          title: string;
          user_id: string;
        };
        Update: {
          content_markdown?: string | null;
          created_at?: string;
          document_id?: string;
          editor_json?: Json | null;
          formatting_metadata?: Json;
          id?: string;
          notes?: string | null;
          source?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string;
          current_markdown: string | null;
          editor_json: Json | null;
          extracted_text: string | null;
          fidelity_status: string;
          file_type: string;
          formatting_metadata: Json;
          id: string;
          original_file_key: string | null;
          source_type: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          word_count: number;
        };
        Insert: {
          created_at?: string;
          current_markdown?: string | null;
          editor_json?: Json | null;
          extracted_text?: string | null;
          fidelity_status?: string;
          file_type?: string;
          formatting_metadata?: Json;
          id?: string;
          original_file_key?: string | null;
          source_type: string;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          word_count?: number;
        };
        Update: {
          created_at?: string;
          current_markdown?: string | null;
          editor_json?: Json | null;
          extracted_text?: string | null;
          fidelity_status?: string;
          file_type?: string;
          formatting_metadata?: Json;
          id?: string;
          original_file_key?: string | null;
          source_type?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          word_count?: number;
        };
        Relationships: [];
      };
      exports: {
        Row: {
          created_at: string;
          document_id: string;
          file_key: string | null;
          format: string;
          id: string;
          status: string;
          user_id: string;
          warning: string | null;
        };
        Insert: {
          created_at?: string;
          document_id: string;
          file_key?: string | null;
          format: string;
          id?: string;
          status?: string;
          user_id: string;
          warning?: string | null;
        };
        Update: {
          created_at?: string;
          document_id?: string;
          file_key?: string | null;
          format?: string;
          id?: string;
          status?: string;
          user_id?: string;
          warning?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exports_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          clerk_id: string;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          clerk_id: string;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          clerk_id?: string;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suggestions: {
        Row: {
          ai_request_id: string | null;
          created_at: string;
          document_id: string;
          explanation: string | null;
          id: string;
          original_text: string;
          status: string;
          suggested_text: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_request_id?: string | null;
          created_at?: string;
          document_id: string;
          explanation?: string | null;
          id?: string;
          original_text: string;
          status?: string;
          suggested_text: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_request_id?: string | null;
          created_at?: string;
          document_id?: string;
          explanation?: string | null;
          id?: string;
          original_text?: string;
          status?: string;
          suggested_text?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suggestions_ai_request_id_fkey";
            columns: ["ai_request_id"];
            isOneToOne: false;
            referencedRelation: "ai_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suggestions_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_ledger: {
        Row: {
          created_at: string;
          document_id: string | null;
          estimated_cost: number | null;
          event_type: string;
          id: string;
          input_tokens: number | null;
          metadata: Json;
          model: string | null;
          output_tokens: number | null;
          provider: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_id?: string | null;
          estimated_cost?: number | null;
          event_type: string;
          id?: string;
          input_tokens?: number | null;
          metadata?: Json;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_id?: string | null;
          estimated_cost?: number | null;
          event_type?: string;
          id?: string;
          input_tokens?: number | null;
          metadata?: Json;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_ledger_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
