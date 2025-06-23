export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          openai_api_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          openai_api_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          openai_api_key?: string
          user_id?: string
        }
        Relationships: []
      }
      bots: {
        Row: {
          assistant_id: string | null
          created_at: string
          id: string
          industry: string | null
          language: string | null
          model: string | null
          name: string
          template: string | null
          user_id: string
        }
        Insert: {
          assistant_id?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          language?: string | null
          model?: string | null
          name: string
          template?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          language?: string | null
          model?: string | null
          name?: string
          template?: string | null
          user_id?: string
        }
        Relationships: []
      }
      faq_data: {
        Row: {
          bot_id: string
          created_at: string
          generated_faq: string | null
          id: string
          original_text: string | null
        }
        Insert: {
          bot_id: string
          created_at?: string
          generated_faq?: string | null
          id?: string
          original_text?: string | null
        }
        Update: {
          bot_id?: string
          created_at?: string
          generated_faq?: string | null
          id?: string
          original_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_data_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          bot_id: string
          content: string | null
          created_at: string
          id: string
          step: number
        }
        Insert: {
          bot_id: string
          content?: string | null
          created_at?: string
          id?: string
          step: number
        }
        Update: {
          bot_id?: string
          content?: string | null
          created_at?: string
          id?: string
          step?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompts_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          prompt_snapshot: Json | null
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          prompt_snapshot?: Json | null
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          prompt_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "versions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      widgets: {
        Row: {
          id: string;
          bot_id: string;
          user_id: string;
          title: string;
          welcome_msg: string | null;
          theme: string;
          color: string;
          avatar_url: string | null;
          logo_url: string | null;
          icon_url: string | null;
          position: string;
          width: number;
          height: number;
          popup_text: string | null;
          popup_delay: number | null;
          created_at: string;
          suggestions: string[] | null;
        };
        Insert: {
          id?: string;
          bot_id: string;
          user_id: string;
          title: string;
          welcome_msg?: string | null;
          theme: string;
          color: string;
          avatar_url?: string | null;
          logo_url?: string | null;
          icon_url?: string | null;
          position: string;
          width: number;
          height: number;
          popup_text?: string | null;
          popup_delay?: number | null;
          created_at?: string;
          suggestions?: string[] | null;
        };
        Update: {
          id?: string;
          bot_id?: string;
          user_id?: string;
          title?: string;
          welcome_msg?: string | null;
          theme?: string;
          color?: string;
          avatar_url?: string | null;
          logo_url?: string | null;
          icon_url?: string | null;
          position?: string;
          width?: number;
          height?: number;
          popup_text?: string | null;
          popup_delay?: number | null;
          created_at?: string;
          suggestions?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "widgets_bot_id_fkey";
            columns: ["bot_id"];
            isOneToOne: false;
            referencedRelation: "bots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "widgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
