export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StoreMode =
  | "OPEN"
  | "TEMPORARILY_CLOSED"
  | "VACATION"
  | "CUSTOM_ORDERS_ONLY"
  | "MAINTENANCE";

export type OrderStatus =
  | "PENDING_APPROVAL"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type OrderSource =
  | "WEBSITE"
  | "MANUAL_WHATSAPP"
  | "MANUAL_INSTAGRAM"
  | "MANUAL_OTHER";

export type AvailabilityMode =
  | "READY_TO_SHIP"
  | "MADE_TO_ORDER"
  | "PRE_ORDER"
  | "OUT_OF_STOCK"
  | "HIDDEN";

export type CustomOrderStatus =
  | "NEW"
  | "QUOTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CONVERTED";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "OWNER" | "STAFF";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "OWNER" | "STAFF";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "OWNER" | "STAFF";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: string;
          business_name: string;
          tagline: string;
          logo_url: string | null;
          banner_url: string | null;
          about_content: string | null;
          address: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          email: string | null;
          instagram_url: string | null;
          other_social: Json;
          store_mode: StoreMode;
          mode_message: string | null;
          vacation_return_date: string | null;
          default_shipping_charge: number;
          free_shipping_threshold: number | null;
          min_order_amount: number;
          low_stock_threshold: number;
          processing_time_text: string | null;
          policies: Json;
          custom_orders_enabled: boolean;
          is_setup_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          tagline?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          about_content?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          instagram_url?: string | null;
          other_social?: Json;
          store_mode?: StoreMode;
          mode_message?: string | null;
          vacation_return_date?: string | null;
          default_shipping_charge?: number;
          free_shipping_threshold?: number | null;
          min_order_amount?: number;
          low_stock_threshold?: number;
          processing_time_text?: string | null;
          policies?: Json;
          custom_orders_enabled?: boolean;
          is_setup_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          tagline?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          about_content?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          instagram_url?: string | null;
          other_social?: Json;
          store_mode?: StoreMode;
          mode_message?: string | null;
          vacation_return_date?: string | null;
          default_shipping_charge?: number;
          free_shipping_threshold?: number | null;
          min_order_amount?: number;
          low_stock_threshold?: number;
          processing_time_text?: string | null;
          policies?: Json;
          custom_orders_enabled?: boolean;
          is_setup_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings_history: {
        Row: {
          id: string;
          changed_by: string | null;
          diff: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          changed_by?: string | null;
          diff: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          changed_by?: string | null;
          diff?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          is_hidden: boolean;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          is_hidden?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          is_hidden?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          base_price: number;
          compare_at_price: number | null;
          availability_mode: AvailabilityMode;
          preparation_days: number;
          stock_quantity: number;
          reserved_quantity: number;
          track_inventory: boolean;
          material: string | null;
          dimensions: string | null;
          is_featured: boolean;
          is_archived: boolean;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          base_price: number;
          compare_at_price?: number | null;
          availability_mode?: AvailabilityMode;
          preparation_days?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          track_inventory?: boolean;
          material?: string | null;
          dimensions?: string | null;
          is_featured?: boolean;
          is_archived?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          base_price?: number;
          compare_at_price?: number | null;
          availability_mode?: AvailabilityMode;
          preparation_days?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          track_inventory?: boolean;
          material?: string | null;
          dimensions?: string | null;
          is_featured?: boolean;
          is_archived?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          option_name: string;
          option_value: string;
          price_modifier: number;
          stock_quantity: number;
          reserved_quantity: number;
          sku: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          option_name: string;
          option_value: string;
          price_modifier?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          option_name?: string;
          option_value?: string;
          price_modifier?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          tracking_hash: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          shipping_address: Json;
          order_notes: string | null;
          owner_notes: string | null;
          customer_visible_note: string | null;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal: number;
          shipping_charge: number;
          adjustment_amount: number;
          adjustment_reason: string | null;
          discount_amount: number;
          final_total: number;
          order_source: OrderSource;
          business_snapshot: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          tracking_hash: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          shipping_address: Json;
          order_notes?: string | null;
          owner_notes?: string | null;
          customer_visible_note?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal: number;
          shipping_charge?: number;
          adjustment_amount?: number;
          adjustment_reason?: string | null;
          discount_amount?: number;
          final_total: number;
          order_source?: OrderSource;
          business_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          tracking_hash?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          shipping_address?: Json;
          order_notes?: string | null;
          owner_notes?: string | null;
          customer_visible_note?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal?: number;
          shipping_charge?: number;
          adjustment_amount?: number;
          adjustment_reason?: string | null;
          discount_amount?: number;
          final_total?: number;
          order_source?: OrderSource;
          business_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_title_snapshot: string;
          variant_snapshot: string | null;
          quantity: number;
          unit_price: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_title_snapshot: string;
          variant_snapshot?: string | null;
          quantity: number;
          unit_price: number;
          line_total: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_title_snapshot?: string;
          variant_snapshot?: string | null;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          old_status: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          old_status?: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          old_status?: OrderStatus | null;
          new_status?: OrderStatus;
          changed_by?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      custom_order_requests: {
        Row: {
          id: string;
          request_number: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          description: string;
          preferred_colors: string | null;
          quantity: number;
          target_date: string | null;
          reference_image_path: string | null;
          quoted_amount: number | null;
          owner_notes: string | null;
          status: CustomOrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_number: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          description: string;
          preferred_colors?: string | null;
          quantity?: number;
          target_date?: string | null;
          reference_image_path?: string | null;
          quoted_amount?: number | null;
          owner_notes?: string | null;
          status?: CustomOrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_number?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          description?: string;
          preferred_colors?: string | null;
          quantity?: number;
          target_date?: string | null;
          reference_image_path?: string | null;
          quoted_amount?: number | null;
          owner_notes?: string | null;
          status?: CustomOrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_adjustments: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          previous_stock: number;
          new_stock: number;
          previous_reserved: number;
          new_reserved: number;
          reason: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          previous_stock: number;
          new_stock: number;
          previous_reserved: number;
          new_reserved: number;
          reason: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          previous_stock?: number;
          new_stock?: number;
          previous_reserved?: number;
          new_reserved?: number;
          reason?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: "ORDER" | "CUSTOM_ENQUIRY" | "LOW_STOCK" | "SYSTEM";
          reference_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type?: "ORDER" | "CUSTOM_ENQUIRY" | "LOW_STOCK" | "SYSTEM";
          reference_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: "ORDER" | "CUSTOM_ENQUIRY" | "LOW_STOCK" | "SYSTEM";
          reference_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_store_settings: {
        Row: {
          business_name: string;
          tagline: string;
          logo_url: string | null;
          banner_url: string | null;
          about_content: string | null;
          address: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          email: string | null;
          instagram_url: string | null;
          other_social: Json;
          store_mode: StoreMode;
          mode_message: string | null;
          vacation_return_date: string | null;
          default_shipping_charge: number;
          free_shipping_threshold: number | null;
          min_order_amount: number;
          processing_time_text: string | null;
          policies: Json;
          custom_orders_enabled: boolean;
          is_setup_completed: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_order_rpc: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email: string | null;
          p_shipping_address: Json;
          p_order_notes: string | null;
          p_order_source: string;
          p_items: Json;
        };
        Returns: Json;
      };
      approve_order_rpc: {
        Args: {
          p_order_id: string;
          p_admin_email: string;
          p_adjustment_amount?: number;
          p_adjustment_reason?: string | null;
          p_owner_note?: string | null;
        };
        Returns: Json;
      };
      reject_or_cancel_order_rpc: {
        Args: {
          p_order_id: string;
          p_new_status: string;
          p_admin_email: string;
          p_reason: string;
        };
        Returns: Json;
      };
      fulfill_order_rpc: {
        Args: {
          p_order_id: string;
          p_new_status: string;
          p_admin_email: string;
          p_tracking_note?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
