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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged: boolean | null
          action_required: boolean | null
          action_url: string | null
          alert_type: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          recipient_role: Database["public"]["Enums"]["app_role"] | null
          related_item_id: string | null
          related_item_type: string | null
          sender_role: Database["public"]["Enums"]["app_role"] | null
          unit_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          action_required?: boolean | null
          action_url?: string | null
          alert_type?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          related_item_id?: string | null
          related_item_type?: string | null
          sender_role?: Database["public"]["Enums"]["app_role"] | null
          unit_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          action_required?: boolean | null
          action_url?: string | null
          alert_type?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          related_item_id?: string | null
          related_item_type?: string | null
          sender_role?: Database["public"]["Enums"]["app_role"] | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals_queue: {
        Row: {
          approval_level: string
          approved_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          request_id: string | null
          required_role: Database["public"]["Enums"]["app_role"]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_level: string
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          request_id?: string | null
          required_role: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_level?: string
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          request_id?: string | null
          required_role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_queue_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_queue_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "inventory_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      barracks_stores: {
        Row: {
          category: string
          created_at: string | null
          id: string
          item_id: string
          item_name: string
          notes: string | null
          qty_issued: number | null
          qty_on_hand: number | null
          reorder_level: number | null
          serviceable: boolean | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          item_id: string
          item_name: string
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          reorder_level?: number | null
          serviceable?: boolean | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          item_id?: string
          item_name?: string
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          reorder_level?: number | null
          serviceable?: boolean | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barracks_stores_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      barracks_stores_distribution: {
        Row: {
          barracks_store_id: string | null
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_by: string | null
          notes: string | null
          quantity: number | null
          return_date: string | null
          soldier_id: string | null
          squadron_id: string | null
        }
        Insert: {
          barracks_store_id?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
        }
        Update: {
          barracks_store_id?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barracks_stores_distribution_barracks_store_id_fkey"
            columns: ["barracks_store_id"]
            isOneToOne: false
            referencedRelation: "barracks_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barracks_stores_distribution_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barracks_stores_distribution_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barracks_stores_distribution_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      bedding_book: {
        Row: {
          bedsheet_condition: string | null
          blanket_condition: string | null
          check_date: string
          created_at: string | null
          id: string
          inspector_id: string | null
          mattress_condition: string | null
          pillow_condition: string | null
          remarks: string | null
          soldier_id: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          bedsheet_condition?: string | null
          blanket_condition?: string | null
          check_date: string
          created_at?: string | null
          id?: string
          inspector_id?: string | null
          mattress_condition?: string | null
          pillow_condition?: string | null
          remarks?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bedsheet_condition?: string | null
          blanket_condition?: string | null
          check_date?: string
          created_at?: string | null
          id?: string
          inspector_id?: string | null
          mattress_condition?: string | null
          pillow_condition?: string | null
          remarks?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bedding_book_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bedding_book_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bedding_book_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      boot_book: {
        Row: {
          boot_size: string | null
          boot_type: string
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          entry_number: string
          id: string
          inspector_id: string | null
          issue_date: string | null
          remarks: string | null
          return_date: string | null
          soldier_id: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          boot_size?: string | null
          boot_type: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          entry_number: string
          id?: string
          inspector_id?: string | null
          issue_date?: string | null
          remarks?: string | null
          return_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          boot_size?: string | null
          boot_type?: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          entry_number?: string
          id?: string
          inspector_id?: string | null
          issue_date?: string | null
          remarks?: string | null
          return_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boot_book_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boot_book_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boot_book_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      clothing_equipment_issues: {
        Row: {
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_by: string | null
          item_id: string | null
          item_name: string
          notes: string | null
          quantity: number | null
          return_date: string | null
          size: string | null
          soldier_id: string
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          size?: string | null
          soldier_id: string
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          size?: string | null
          soldier_id?: string
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clothing_equipment_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothing_equipment_issues_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "clothing_equipment_scale"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothing_equipment_issues_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothing_equipment_issues_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      clothing_equipment_scale: {
        Row: {
          authorized_quantity: number | null
          category: string
          created_at: string | null
          id: string
          item_code: string | null
          item_name: string
          notes: string | null
          size_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          authorized_quantity?: number | null
          category: string
          created_at?: string | null
          id?: string
          item_code?: string | null
          item_name: string
          notes?: string | null
          size_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          authorized_quantity?: number | null
          category?: string
          created_at?: string | null
          id?: string
          item_code?: string | null
          item_name?: string
          notes?: string | null
          size_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clothing_exchanges: {
        Row: {
          created_at: string | null
          exchange_date: string
          exchange_month: string
          exchange_reason: string | null
          id: string
          item_name: string
          items_handed_in: string[] | null
          items_issued: string[] | null
          notes: string | null
          processed_by_id: string | null
          qm_approved: boolean | null
          qm_decision: string | null
          qm_reviewed: boolean | null
          qm_reviewed_by_id: string | null
          quantity_exchanged: number | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exchange_date?: string
          exchange_month: string
          exchange_reason?: string | null
          id?: string
          item_name: string
          items_handed_in?: string[] | null
          items_issued?: string[] | null
          notes?: string | null
          processed_by_id?: string | null
          qm_approved?: boolean | null
          qm_decision?: string | null
          qm_reviewed?: boolean | null
          qm_reviewed_by_id?: string | null
          quantity_exchanged?: number | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exchange_date?: string
          exchange_month?: string
          exchange_reason?: string | null
          id?: string
          item_name?: string
          items_handed_in?: string[] | null
          items_issued?: string[] | null
          notes?: string | null
          processed_by_id?: string | null
          qm_approved?: boolean | null
          qm_decision?: string | null
          qm_reviewed?: boolean | null
          qm_reviewed_by_id?: string | null
          quantity_exchanged?: number | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clothing_exchanges_processed_by_id_fkey"
            columns: ["processed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothing_exchanges_qm_reviewed_by_id_fkey"
            columns: ["qm_reviewed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothing_exchanges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      department_assignments: {
        Row: {
          assigned_at: string | null
          department_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          department_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          department_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          operating_unit_id: string | null
          parent_unit_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          operating_unit_id?: string | null
          parent_unit_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          operating_unit_id?: string | null
          parent_unit_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_operating_unit_id_fkey"
            columns: ["operating_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_unit_id_fkey"
            columns: ["parent_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      document_captures: {
        Row: {
          captured_by: string
          category: string | null
          created_at: string
          extracted_fields: Json | null
          extracted_text: string | null
          extraction_error: string | null
          extraction_status: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          captured_by: string
          category?: string | null
          created_at?: string
          extracted_fields?: Json | null
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_status?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          captured_by?: string
          category?: string | null
          created_at?: string
          extracted_fields?: Json | null
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_status?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_captures_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_captures_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_captures_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_equipment: {
        Row: {
          authority: string | null
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          equip_id: string
          equipment_name: string
          id: string
          issue_date: string | null
          issued_to: string | null
          last_inspection_date: string | null
          next_inspection_due: string | null
          notes: string | null
          qty_issued: number | null
          qty_on_hand: number | null
          qty_returned: number | null
          return_date: string | null
          serviceable: boolean | null
          squadron_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          authority?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          equip_id: string
          equipment_name: string
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          authority?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          equip_id?: string
          equipment_name?: string
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_equipment_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_equipment_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_kit_items: {
        Row: {
          category: string
          id: string
          item_name: string
          kit_id: string
          quantity: number
        }
        Insert: {
          category: string
          id?: string
          item_name: string
          kit_id: string
          quantity?: number
        }
        Update: {
          category?: string
          id?: string
          item_name?: string
          kit_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "equipment_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_kits: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          kit_name: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kit_name: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kit_name?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_kits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_kits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      explosives: {
        Row: {
          authority: string
          created_at: string | null
          explosive_id: string
          id: string
          issue_date: string | null
          issued_to: string | null
          lot_number: string
          notes: string | null
          quantity_issued: number | null
          quantity_received: number | null
          quantity_returned: number | null
          return_date: string | null
          squadron_id: string | null
          storage_location: string
          type: string
          updated_at: string | null
        }
        Insert: {
          authority: string
          created_at?: string | null
          explosive_id: string
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          lot_number: string
          notes?: string | null
          quantity_issued?: number | null
          quantity_received?: number | null
          quantity_returned?: number | null
          return_date?: string | null
          squadron_id?: string | null
          storage_location: string
          type: string
          updated_at?: string | null
        }
        Update: {
          authority?: string
          created_at?: string | null
          explosive_id?: string
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          lot_number?: string
          notes?: string | null
          quantity_issued?: number | null
          quantity_received?: number | null
          quantity_returned?: number | null
          return_date?: string | null
          squadron_id?: string | null
          storage_location?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "explosives_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "explosives_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      explosives_change_requests: {
        Row: {
          action_type: string
          changes: Json | null
          created_at: string
          explosives_id: string | null
          id: string
          justification: string | null
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_type: string
          changes?: Json | null
          created_at?: string
          explosives_id?: string | null
          id?: string
          justification?: string | null
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_type?: string
          changes?: Json | null
          created_at?: string
          explosives_id?: string | null
          id?: string
          justification?: string | null
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "explosives_change_requests_explosives_id_fkey"
            columns: ["explosives_id"]
            isOneToOne: false
            referencedRelation: "explosives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "explosives_change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "explosives_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          created_at: string | null
          element: string | null
          facility_id: string
          facility_name: string
          id: string
          last_inspection: string | null
          not_working: number | null
          notes: string | null
          quantity: number | null
          squadron_id: string | null
          updated_at: string | null
          working: number | null
        }
        Insert: {
          created_at?: string | null
          element?: string | null
          facility_id: string
          facility_name: string
          id?: string
          last_inspection?: string | null
          not_working?: number | null
          notes?: string | null
          quantity?: number | null
          squadron_id?: string | null
          updated_at?: string | null
          working?: number | null
        }
        Update: {
          created_at?: string | null
          element?: string | null
          facility_id?: string
          facility_name?: string
          id?: string
          last_inspection?: string | null
          not_working?: number | null
          notes?: string | null
          quantity?: number | null
          squadron_id?: string | null
          updated_at?: string | null
          working?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_tanks: {
        Row: {
          capacity_liters: number
          created_at: string
          fuel_type: string
          id: string
          is_active: boolean
          label: string
          unit_id: string | null
        }
        Insert: {
          capacity_liters: number
          created_at?: string
          fuel_type: string
          id?: string
          is_active?: boolean
          label: string
          unit_id?: string | null
        }
        Update: {
          capacity_liters?: number
          created_at?: string
          fuel_type?: string
          id?: string
          is_active?: boolean
          label?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_tanks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          driver_id: string | null
          driver_name: string | null
          id: string
          liters: number
          notes: string | null
          reference_number: string | null
          scan_method: string | null
          supplier_name: string | null
          tank_id: string
          transaction_type: string
          vehicle_id: string | null
          vehicle_registration: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          liters: number
          notes?: string | null
          reference_number?: string | null
          scan_method?: string | null
          supplier_name?: string | null
          tank_id: string
          transaction_type: string
          vehicle_id?: string | null
          vehicle_registration?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          liters?: number
          notes?: string | null
          reference_number?: string | null
          scan_method?: string | null
          supplier_name?: string | null
          tank_id?: string
          transaction_type?: string
          vehicle_id?: string | null
          vehicle_registration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_transactions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "consumption_7day_avg"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "consumption_variance"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "daily_consumption"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "fuel_tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tank_current_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tank_days_remaining"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "fuel_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      general_inventory: {
        Row: {
          category: string
          created_at: string | null
          id: string
          item_id: string
          item_name: string
          last_stock_check: string | null
          notes: string | null
          qty_issued_monthly: number | null
          qty_on_hand: number | null
          qty_returned_monthly: number | null
          reorder_level: number | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          item_id: string
          item_name: string
          last_stock_check?: string | null
          notes?: string | null
          qty_issued_monthly?: number | null
          qty_on_hand?: number | null
          qty_returned_monthly?: number | null
          reorder_level?: number | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          item_id?: string
          item_name?: string
          last_stock_check?: string | null
          notes?: string | null
          qty_issued_monthly?: number | null
          qty_on_hand?: number | null
          qty_returned_monthly?: number | null
          reorder_level?: number | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "general_inventory_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          assigned_to: string | null
          category: string
          condition: string | null
          created_at: string | null
          id: string
          issued_date: string | null
          name: string
          return_date: string | null
          serial_number: string | null
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          condition?: string | null
          created_at?: string | null
          id?: string
          issued_date?: string | null
          name: string
          return_date?: string | null
          serial_number?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          condition?: string | null
          created_at?: string | null
          id?: string
          issued_date?: string | null
          name?: string
          return_date?: string | null
          serial_number?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          item_id: string | null
          item_name: string | null
          item_type: string
          justification: string
          quantity: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          report_generated: boolean | null
          report_url: string | null
          request_type: string
          requester_id: string
          requester_role: Database["public"]["Enums"]["app_role"]
          specifications: string | null
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name?: string | null
          item_type: string
          justification: string
          quantity?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          report_generated?: boolean | null
          report_url?: string | null
          request_type: string
          requester_id: string
          requester_role: Database["public"]["Enums"]["app_role"]
          specifications?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name?: string | null
          item_type?: string
          justification?: string
          quantity?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          report_generated?: boolean | null
          report_url?: string | null
          request_type?: string
          requester_id?: string
          requester_role?: Database["public"]["Enums"]["app_role"]
          specifications?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_requests_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      jerrican_inventory: {
        Row: {
          battalion_reserve: boolean | null
          capacity: number | null
          condition: string | null
          created_at: string | null
          current_level: number | null
          fuel_type: string | null
          id: string
          jerrican_number: string
          last_checked_date: string | null
          location: string | null
          notes: string | null
          unit_id: string | null
          updated_at: string | null
          vehicle_assigned: string | null
        }
        Insert: {
          battalion_reserve?: boolean | null
          capacity?: number | null
          condition?: string | null
          created_at?: string | null
          current_level?: number | null
          fuel_type?: string | null
          id?: string
          jerrican_number: string
          last_checked_date?: string | null
          location?: string | null
          notes?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_assigned?: string | null
        }
        Update: {
          battalion_reserve?: boolean | null
          capacity?: number | null
          condition?: string | null
          created_at?: string | null
          current_level?: number | null
          fuel_type?: string | null
          id?: string
          jerrican_number?: string
          last_checked_date?: string | null
          location?: string | null
          notes?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_assigned?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jerrican_inventory_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jerrican_inventory_vehicle_assigned_fkey"
            columns: ["vehicle_assigned"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_inspections: {
        Row: {
          created_at: string | null
          deficiencies: Json | null
          equipment_status: string | null
          follow_up_completed: boolean | null
          follow_up_required: boolean | null
          id: string
          inspection_date: string
          inspector_id: string | null
          notes: string | null
          overall_status: string | null
          soldier_id: string
          squadron_id: string | null
          uniform_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deficiencies?: Json | null
          equipment_status?: string | null
          follow_up_completed?: boolean | null
          follow_up_required?: boolean | null
          id?: string
          inspection_date?: string
          inspector_id?: string | null
          notes?: string | null
          overall_status?: string | null
          soldier_id: string
          squadron_id?: string | null
          uniform_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deficiencies?: Json | null
          equipment_status?: string | null
          follow_up_completed?: boolean | null
          follow_up_required?: boolean | null
          id?: string
          inspection_date?: string
          inspector_id?: string | null
          notes?: string | null
          overall_status?: string | null
          soldier_id?: string
          squadron_id?: string | null
          uniform_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kit_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_inspections_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_inspections_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_book: {
        Row: {
          condition: string | null
          created_at: string | null
          entry_date: string
          id: string
          inspector_id: string | null
          item_type: string
          quantity: number | null
          remarks: string | null
          return_date: string | null
          sent_date: string | null
          soldier_id: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_type: string
          quantity?: number | null
          remarks?: string | null
          return_date?: string | null
          sent_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_type?: string
          quantity?: number | null
          remarks?: string | null
          return_date?: string | null
          sent_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laundry_book_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laundry_book_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laundry_book_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanics_tools: {
        Row: {
          authority: string | null
          category: string
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          last_inspection_date: string | null
          next_inspection_due: string | null
          notes: string | null
          qty_issued: number | null
          qty_on_hand: number | null
          return_date: string | null
          serviceable: boolean | null
          squadron_id: string | null
          tool_id: string
          tool_name: string
          updated_at: string | null
        }
        Insert: {
          authority?: string | null
          category: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          tool_id: string
          tool_name: string
          updated_at?: string | null
        }
        Update: {
          authority?: string | null
          category?: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          tool_id?: string
          tool_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mt_accidents: {
        Row: {
          accident_date: string
          accident_number: string
          accident_time: string | null
          accident_type: string | null
          comptroller_report_date: string | null
          comptroller_report_submitted: boolean | null
          created_at: string | null
          driver_id: string | null
          driver_permit_withdrawn: boolean | null
          driver_statement: string | null
          estimated_repair_cost: number | null
          id: string
          liability: string | null
          location: string
          mto_report_submitted: boolean | null
          notes: string | null
          passengers_injured: number | null
          pedestrians_injured: number | null
          police_report_filed: boolean | null
          police_report_number: string | null
          police_station: string | null
          property_damage_description: string | null
          reported_to_mto: boolean | null
          reported_to_orderly_officer: boolean | null
          reported_to_police: boolean | null
          road_conditions: string | null
          sketch_url: string | null
          speed_limit: number | null
          status: string | null
          updated_at: string | null
          vehicle_damage_description: string | null
          vehicle_id: string | null
          vehicle_speed: number | null
          weather_conditions: string | null
          withdrawal_duration_months: number | null
          witness_statements: string[] | null
        }
        Insert: {
          accident_date: string
          accident_number: string
          accident_time?: string | null
          accident_type?: string | null
          comptroller_report_date?: string | null
          comptroller_report_submitted?: boolean | null
          created_at?: string | null
          driver_id?: string | null
          driver_permit_withdrawn?: boolean | null
          driver_statement?: string | null
          estimated_repair_cost?: number | null
          id?: string
          liability?: string | null
          location: string
          mto_report_submitted?: boolean | null
          notes?: string | null
          passengers_injured?: number | null
          pedestrians_injured?: number | null
          police_report_filed?: boolean | null
          police_report_number?: string | null
          police_station?: string | null
          property_damage_description?: string | null
          reported_to_mto?: boolean | null
          reported_to_orderly_officer?: boolean | null
          reported_to_police?: boolean | null
          road_conditions?: string | null
          sketch_url?: string | null
          speed_limit?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_damage_description?: string | null
          vehicle_id?: string | null
          vehicle_speed?: number | null
          weather_conditions?: string | null
          withdrawal_duration_months?: number | null
          witness_statements?: string[] | null
        }
        Update: {
          accident_date?: string
          accident_number?: string
          accident_time?: string | null
          accident_type?: string | null
          comptroller_report_date?: string | null
          comptroller_report_submitted?: boolean | null
          created_at?: string | null
          driver_id?: string | null
          driver_permit_withdrawn?: boolean | null
          driver_statement?: string | null
          estimated_repair_cost?: number | null
          id?: string
          liability?: string | null
          location?: string
          mto_report_submitted?: boolean | null
          notes?: string | null
          passengers_injured?: number | null
          pedestrians_injured?: number | null
          police_report_filed?: boolean | null
          police_report_number?: string | null
          police_station?: string | null
          property_damage_description?: string | null
          reported_to_mto?: boolean | null
          reported_to_orderly_officer?: boolean | null
          reported_to_police?: boolean | null
          road_conditions?: string | null
          sketch_url?: string | null
          speed_limit?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_damage_description?: string | null
          vehicle_id?: string | null
          vehicle_speed?: number | null
          weather_conditions?: string | null
          withdrawal_duration_months?: number | null
          witness_statements?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "mt_accidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_accidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_detail_sheets: {
        Row: {
          copies_to_adjutant: number | null
          created_at: string | null
          detail_date: string
          detail_notes: string | null
          duty_driver: string | null
          id: string
          issued_by_id: string | null
          mt_clerk: string | null
          mt_sergeant: string | null
          mt_stores_sergeant: string | null
          night_duty_nco: string | null
          pol_storeman: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          copies_to_adjutant?: number | null
          created_at?: string | null
          detail_date: string
          detail_notes?: string | null
          duty_driver?: string | null
          id?: string
          issued_by_id?: string | null
          mt_clerk?: string | null
          mt_sergeant?: string | null
          mt_stores_sergeant?: string | null
          night_duty_nco?: string | null
          pol_storeman?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          copies_to_adjutant?: number | null
          created_at?: string | null
          detail_date?: string
          detail_notes?: string | null
          duty_driver?: string | null
          id?: string
          issued_by_id?: string | null
          mt_clerk?: string | null
          mt_sergeant?: string | null
          mt_stores_sergeant?: string | null
          night_duty_nco?: string | null
          pol_storeman?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mt_detail_sheets_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_detail_sheets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_driver_permits: {
        Row: {
          created_at: string | null
          driver_id: string
          expiry_date: string
          id: string
          issued_by_id: string | null
          issued_date: string
          permit_number: string
          status: string | null
          updated_at: string | null
          vehicle_classes: string[]
          withdrawal_reason: string | null
          withdrawn_date: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          expiry_date: string
          id?: string
          issued_by_id?: string | null
          issued_date: string
          permit_number: string
          status?: string | null
          updated_at?: string | null
          vehicle_classes: string[]
          withdrawal_reason?: string | null
          withdrawn_date?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          expiry_date?: string
          id?: string
          issued_by_id?: string | null
          issued_date?: string
          permit_number?: string
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[]
          withdrawal_reason?: string | null
          withdrawn_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mt_driver_permits_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_driver_permits_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_driver_tests: {
        Row: {
          created_at: string | null
          driver_id: string
          examiner_name: string
          examiner_role: string | null
          id: string
          notes: string | null
          test_date: string
          test_result: string
          test_type: string
          vehicle_class: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          examiner_name: string
          examiner_role?: string | null
          id?: string
          notes?: string | null
          test_date: string
          test_result: string
          test_type: string
          vehicle_class: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          examiner_name?: string
          examiner_role?: string | null
          id?: string
          notes?: string | null
          test_date?: string
          test_result?: string
          test_type?: string
          vehicle_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt_driver_tests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_facilities: {
        Row: {
          capacity: number | null
          created_at: string | null
          equipment_present: string | null
          facility_id: string
          facility_name: string
          facility_type: string
          id: string
          last_maintenance_date: string | null
          location: string | null
          next_maintenance_due: string | null
          notes: string | null
          squadron_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          equipment_present?: string | null
          facility_id: string
          facility_name: string
          facility_type: string
          id?: string
          last_maintenance_date?: string | null
          location?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          squadron_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          equipment_present?: string | null
          facility_id?: string
          facility_name?: string
          facility_type?: string
          id?: string
          last_maintenance_date?: string | null
          location?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          squadron_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mt_vehicle_allocations: {
        Row: {
          allocated_from: string
          allocated_to_id: string
          allocated_until: string | null
          allocation_type: string
          created_at: string | null
          id: string
          notes: string | null
          unit_id: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          allocated_from: string
          allocated_to_id: string
          allocated_until?: string | null
          allocation_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          allocated_from?: string
          allocated_to_id?: string
          allocated_until?: string | null
          allocation_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt_vehicle_allocations_allocated_to_id_fkey"
            columns: ["allocated_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_vehicle_allocations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_vehicle_allocations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_work_tickets: {
        Row: {
          authorized_by: string | null
          condition_on_issue: string | null
          condition_on_return: string | null
          created_at: string | null
          destination: string
          driver_id: string | null
          id: string
          issue_date: string
          issue_time: string | null
          issued_by_id: string | null
          journey_purpose: string
          load_description: string | null
          mileage_end: number | null
          mileage_start: number | null
          mileage_total: number | null
          notes: string | null
          oil_issued: number | null
          passenger_count: number | null
          petrol_issued: number | null
          return_date: string | null
          return_time: string | null
          route: string | null
          status: string | null
          ticket_number: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          authorized_by?: string | null
          condition_on_issue?: string | null
          condition_on_return?: string | null
          created_at?: string | null
          destination: string
          driver_id?: string | null
          id?: string
          issue_date: string
          issue_time?: string | null
          issued_by_id?: string | null
          journey_purpose: string
          load_description?: string | null
          mileage_end?: number | null
          mileage_start?: number | null
          mileage_total?: number | null
          notes?: string | null
          oil_issued?: number | null
          passenger_count?: number | null
          petrol_issued?: number | null
          return_date?: string | null
          return_time?: string | null
          route?: string | null
          status?: string | null
          ticket_number: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          authorized_by?: string | null
          condition_on_issue?: string | null
          condition_on_return?: string | null
          created_at?: string | null
          destination?: string
          driver_id?: string | null
          id?: string
          issue_date?: string
          issue_time?: string | null
          issued_by_id?: string | null
          journey_purpose?: string
          load_description?: string | null
          mileage_end?: number | null
          mileage_start?: number | null
          mileage_total?: number | null
          notes?: string | null
          oil_issued?: number | null
          passenger_count?: number | null
          petrol_issued?: number | null
          return_date?: string | null
          return_time?: string | null
          route?: string | null
          status?: string | null
          ticket_number?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mt_work_tickets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_work_tickets_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_work_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_machinery: {
        Row: {
          created_at: string | null
          fuel_type: string | null
          fuel_used_monthly: number | null
          id: string
          last_service_date: string | null
          location: string | null
          make_model: string | null
          next_service_due: string | null
          notes: string | null
          operator_assigned: string | null
          plant_id: string
          serial_number: string | null
          service_interval_days: number | null
          serviceability: string | null
          squadron_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fuel_type?: string | null
          fuel_used_monthly?: number | null
          id?: string
          last_service_date?: string | null
          location?: string | null
          make_model?: string | null
          next_service_due?: string | null
          notes?: string | null
          operator_assigned?: string | null
          plant_id: string
          serial_number?: string | null
          service_interval_days?: number | null
          serviceability?: string | null
          squadron_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fuel_type?: string | null
          fuel_used_monthly?: number | null
          id?: string
          last_service_date?: string | null
          location?: string | null
          make_model?: string | null
          next_service_due?: string | null
          notes?: string | null
          operator_assigned?: string | null
          plant_id?: string
          serial_number?: string | null
          service_interval_days?: number | null
          serviceability?: string | null
          squadron_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_machinery_operator_assigned_fkey"
            columns: ["operator_assigned"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_machinery_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pol_accounts: {
        Row: {
          account_period_month: string
          created_at: string | null
          id: string
          issued_by_id: string | null
          issued_date: string
          lubricant_issued: number
          mileage_end: number | null
          mileage_start: number | null
          mileage_total: number | null
          mpg_calculated: number | null
          notes: string | null
          oil_issued: number
          petrol_issued: number
          submitted_date: string | null
          submitted_to_co: boolean | null
          submitted_to_mto: boolean | null
          unit_id: string | null
          updated_at: string | null
          vehicle_id: string | null
          work_ticket_id: string | null
        }
        Insert: {
          account_period_month: string
          created_at?: string | null
          id?: string
          issued_by_id?: string | null
          issued_date: string
          lubricant_issued?: number
          mileage_end?: number | null
          mileage_start?: number | null
          mileage_total?: number | null
          mpg_calculated?: number | null
          notes?: string | null
          oil_issued?: number
          petrol_issued?: number
          submitted_date?: string | null
          submitted_to_co?: boolean | null
          submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          work_ticket_id?: string | null
        }
        Update: {
          account_period_month?: string
          created_at?: string | null
          id?: string
          issued_by_id?: string | null
          issued_date?: string
          lubricant_issued?: number
          mileage_end?: number | null
          mileage_start?: number | null
          mileage_total?: number | null
          mpg_calculated?: number | null
          notes?: string | null
          oil_issued?: number
          petrol_issued?: number
          submitted_date?: string | null
          submitted_to_co?: boolean | null
          submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          work_ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pol_accounts_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_accounts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_accounts_work_ticket_id_fkey"
            columns: ["work_ticket_id"]
            isOneToOne: false
            referencedRelation: "mt_work_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      pol_storage: {
        Row: {
          access_controlled: boolean | null
          capacity: number | null
          created_at: string | null
          current_level: number | null
          fire_alarm_installed: boolean | null
          fire_extinguishers_count: number | null
          fire_point_equipped: boolean | null
          fuel_type: string | null
          id: string
          key_holder_id: string | null
          last_inspection_date: string | null
          last_refilled_date: string | null
          location: string | null
          no_smoking_signs_posted: boolean | null
          notes: string | null
          sand_buckets_count: number | null
          security_status: string | null
          storage_location: string
          storage_type: string | null
          unit: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_controlled?: boolean | null
          capacity?: number | null
          created_at?: string | null
          current_level?: number | null
          fire_alarm_installed?: boolean | null
          fire_extinguishers_count?: number | null
          fire_point_equipped?: boolean | null
          fuel_type?: string | null
          id?: string
          key_holder_id?: string | null
          last_inspection_date?: string | null
          last_refilled_date?: string | null
          location?: string | null
          no_smoking_signs_posted?: boolean | null
          notes?: string | null
          sand_buckets_count?: number | null
          security_status?: string | null
          storage_location: string
          storage_type?: string | null
          unit?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_controlled?: boolean | null
          capacity?: number | null
          created_at?: string | null
          current_level?: number | null
          fire_alarm_installed?: boolean | null
          fire_extinguishers_count?: number | null
          fire_point_equipped?: boolean | null
          fuel_type?: string | null
          id?: string
          key_holder_id?: string | null
          last_inspection_date?: string | null
          last_refilled_date?: string | null
          location?: string | null
          no_smoking_signs_posted?: boolean | null
          notes?: string | null
          sand_buckets_count?: number | null
          security_status?: string | null
          storage_location?: string
          storage_type?: string | null
          unit?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pol_storage_key_holder_id_fkey"
            columns: ["key_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_storage_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pol_transactions: {
        Row: {
          authorized_by: string | null
          closing_balance: number | null
          created_at: string | null
          fuel_type: string
          id: string
          issued_to: string | null
          notes: string | null
          opening_balance: number | null
          quantity: number
          received_from: string | null
          squadron_id: string | null
          transaction_date: string
          transaction_type: string
          vehicle_id: string | null
          work_ticket_id: string | null
        }
        Insert: {
          authorized_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          fuel_type: string
          id?: string
          issued_to?: string | null
          notes?: string | null
          opening_balance?: number | null
          quantity: number
          received_from?: string | null
          squadron_id?: string | null
          transaction_date?: string
          transaction_type: string
          vehicle_id?: string | null
          work_ticket_id?: string | null
        }
        Update: {
          authorized_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          fuel_type?: string
          id?: string
          issued_to?: string | null
          notes?: string | null
          opening_balance?: number | null
          quantity?: number
          received_from?: string | null
          squadron_id?: string | null
          transaction_date?: string
          transaction_type?: string
          vehicle_id?: string | null
          work_ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pol_transactions_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_transactions_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pol_transactions_work_ticket_id_fkey"
            columns: ["work_ticket_id"]
            isOneToOne: false
            referencedRelation: "mt_work_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ppe: {
        Row: {
          category: string
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          item: string
          notes: string | null
          ppe_id: string
          qty_issued: number | null
          qty_on_hand: number | null
          qty_returned: number | null
          return_date: string | null
          serviceable: boolean | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item: string
          notes?: string | null
          ppe_id: string
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item?: string
          notes?: string | null
          ppe_id?: string
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppe_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ppe_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          name: string
          pin_enabled: boolean
          rank: string | null
          service_number: string | null
          unit_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id: string
          name: string
          pin_enabled?: boolean
          rank?: string | null
          service_number?: string | null
          unit_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pin_enabled?: boolean
          rank?: string | null
          service_number?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_book: {
        Row: {
          cost: number | null
          created_at: string | null
          defect_description: string | null
          entry_date: string
          id: string
          inspector_id: string | null
          item_description: string | null
          item_type: string
          remarks: string | null
          repair_status: string | null
          return_date: string | null
          sent_date: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          defect_description?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_description?: string | null
          item_type: string
          remarks?: string | null
          repair_status?: string | null
          return_date?: string | null
          sent_date?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          defect_description?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_description?: string | null
          item_type?: string
          remarks?: string | null
          repair_status?: string | null
          return_date?: string | null
          sent_date?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_book_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_book_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_for: string | null
          file_url: string | null
          id: string
          summary: string | null
          type: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_for?: string | null
          file_url?: string | null
          id?: string
          summary?: string | null
          type: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_for?: string | null
          file_url?: string | null
          id?: string
          summary?: string | null
          type?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      room_inventory: {
        Row: {
          created_at: string | null
          expected_qty: number | null
          id: string
          inspection_date: string | null
          inspector: string | null
          inventory_item: string
          notes: string | null
          occupants: string | null
          platoon_company: string | null
          present_qty: number | null
          room_id: string
          room_type: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expected_qty?: number | null
          id?: string
          inspection_date?: string | null
          inspector?: string | null
          inventory_item: string
          notes?: string | null
          occupants?: string | null
          platoon_company?: string | null
          present_qty?: number | null
          room_id: string
          room_type?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expected_qty?: number | null
          id?: string
          inspection_date?: string | null
          inspector?: string | null
          inventory_item?: string
          notes?: string | null
          occupants?: string | null
          platoon_company?: string | null
          present_qty?: number | null
          room_id?: string
          room_type?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_inventory_inspector_fkey"
            columns: ["inspector"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_inventory_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      sensitive_unlock_log: {
        Row: {
          context: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          context: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          context?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_unlock_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tailor_book: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string | null
          entry_date: string
          id: string
          inspector_id: string | null
          item_type: string
          paid: boolean | null
          remarks: string | null
          return_date: string | null
          sent_date: string | null
          soldier_id: string | null
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_type: string
          paid?: boolean | null
          remarks?: string | null
          return_date?: string | null
          sent_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          inspector_id?: string | null
          item_type?: string
          paid?: boolean | null
          remarks?: string | null
          return_date?: string | null
          sent_date?: string | null
          soldier_id?: string | null
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tailor_book_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_book_soldier_id_fkey"
            columns: ["soldier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_book_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tank_dips: {
        Row: {
          activity_since: number | null
          book_level: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          dip_context: string
          dip_date: string
          dip_time: string
          discrepancy: number
          expected_level: number | null
          id: string
          is_reference_only: boolean
          measured_liters: number
          notes: string | null
          period_variance: number | null
          previous_dip_id: string | null
          previous_dip_measured: number | null
          reading_suspect: boolean
          recorded_by: string | null
          resolution_notes: string | null
          severity: string
          tank_id: string
          transactions_in_period: number | null
        }
        Insert: {
          activity_since?: number | null
          book_level: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          dip_context?: string
          dip_date?: string
          dip_time?: string
          discrepancy: number
          expected_level?: number | null
          id?: string
          is_reference_only?: boolean
          measured_liters: number
          notes?: string | null
          period_variance?: number | null
          previous_dip_id?: string | null
          previous_dip_measured?: number | null
          reading_suspect?: boolean
          recorded_by?: string | null
          resolution_notes?: string | null
          severity?: string
          tank_id: string
          transactions_in_period?: number | null
        }
        Update: {
          activity_since?: number | null
          book_level?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          dip_context?: string
          dip_date?: string
          dip_time?: string
          discrepancy?: number
          expected_level?: number | null
          id?: string
          is_reference_only?: boolean
          measured_liters?: number
          notes?: string | null
          period_variance?: number | null
          previous_dip_id?: string | null
          previous_dip_measured?: number | null
          reading_suspect?: boolean
          recorded_by?: string | null
          resolution_notes?: string | null
          severity?: string
          tank_id?: string
          transactions_in_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tank_dips_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_dips_previous_dip_id_fkey"
            columns: ["previous_dip_id"]
            isOneToOne: false
            referencedRelation: "tank_dips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_dips_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "consumption_7day_avg"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "consumption_variance"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "daily_consumption"
            referencedColumns: ["tank_id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "fuel_tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tank_current_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_dips_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tank_days_remaining"
            referencedColumns: ["tank_id"]
          },
        ]
      }
      tools: {
        Row: {
          authority: string | null
          category: string
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          last_inspection_date: string | null
          next_inspection_due: string | null
          notes: string | null
          qty_issued: number | null
          qty_on_hand: number | null
          qty_returned: number | null
          return_date: string | null
          serviceable: boolean | null
          squadron_id: string | null
          tool_id: string
          tool_name: string
          updated_at: string | null
        }
        Insert: {
          authority?: string | null
          category: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          tool_id: string
          tool_name: string
          updated_at?: string | null
        }
        Update: {
          authority?: string | null
          category?: string
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          tool_id?: string
          tool_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          id: string
          issue_date: string | null
          issued_by: string | null
          item_id: string | null
          received_by: string | null
          remarks: string | null
          return_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          item_id?: string | null
          received_by?: string | null
          remarks?: string | null
          return_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          item_id?: string | null
          received_by?: string | null
          remarks?: string | null
          return_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_detailed: {
        Row: {
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          issued_by_id: string | null
          item_id: string
          item_name: string | null
          item_table: string
          notes: string | null
          quantity: number | null
          serviceability: string | null
          to_user_id: string | null
          transaction_type: string
          unit_id: string | null
        }
        Insert: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          issued_by_id?: string | null
          item_id: string
          item_name?: string | null
          item_table: string
          notes?: string | null
          quantity?: number | null
          serviceability?: string | null
          to_user_id?: string | null
          transaction_type: string
          unit_id?: string | null
        }
        Update: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          issued_by_id?: string | null
          item_id?: string
          item_name?: string | null
          item_table?: string
          notes?: string | null
          quantity?: number | null
          serviceability?: string | null
          to_user_id?: string | null
          transaction_type?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_detailed_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_detailed_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_detailed_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_detailed_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      uniform_sets: {
        Row: {
          components: Json
          created_at: string | null
          description: string | null
          dress_type: string
          id: string
          set_id: string
          set_name: string
          squadron_id: string | null
          updated_at: string | null
        }
        Insert: {
          components?: Json
          created_at?: string | null
          description?: string | null
          dress_type: string
          id?: string
          set_id: string
          set_name: string
          squadron_id?: string | null
          updated_at?: string | null
        }
        Update: {
          components?: Json
          created_at?: string | null
          description?: string | null
          dress_type?: string
          id?: string
          set_id?: string
          set_name?: string
          squadron_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uniform_sets_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      uniforms: {
        Row: {
          category: string | null
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          item_name: string
          notes: string | null
          qty_issued: number | null
          qty_on_hand: number | null
          qty_returned: number | null
          return_date: string | null
          serviceable: boolean | null
          size: string | null
          squadron_id: string | null
          uniform_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item_name: string
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          size?: string | null
          squadron_id?: string | null
          uniform_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item_name?: string
          notes?: string | null
          qty_issued?: number | null
          qty_on_hand?: number | null
          qty_returned?: number | null
          return_date?: string | null
          serviceable?: boolean | null
          size?: string | null
          squadron_id?: string | null
          uniform_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uniforms_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniforms_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_inspections: {
        Row: {
          body_condition: string | null
          brakes_condition: string | null
          co_viewed_date: string | null
          created_at: string | null
          defects_corrected: string[] | null
          defects_found: string[] | null
          defects_pending: string[] | null
          driver_servicing_efficiency: string | null
          electrical_condition: string | null
          engine_condition: string | null
          form_type: string | null
          forwarded_to_co: boolean | null
          id: string
          inspected_by_id: string | null
          inspection_date: string
          inspection_number: string
          inspection_type: string
          inspector_name: string | null
          inspector_role: string | null
          lights_condition: string | null
          next_inspection_due: string | null
          notes: string | null
          recommendation: string | null
          serviceability_status: string | null
          steering_condition: string | null
          suspension_condition: string | null
          tires_condition: string | null
          transmission_condition: string | null
          unit_id: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          body_condition?: string | null
          brakes_condition?: string | null
          co_viewed_date?: string | null
          created_at?: string | null
          defects_corrected?: string[] | null
          defects_found?: string[] | null
          defects_pending?: string[] | null
          driver_servicing_efficiency?: string | null
          electrical_condition?: string | null
          engine_condition?: string | null
          form_type?: string | null
          forwarded_to_co?: boolean | null
          id?: string
          inspected_by_id?: string | null
          inspection_date: string
          inspection_number: string
          inspection_type: string
          inspector_name?: string | null
          inspector_role?: string | null
          lights_condition?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          recommendation?: string | null
          serviceability_status?: string | null
          steering_condition?: string | null
          suspension_condition?: string | null
          tires_condition?: string | null
          transmission_condition?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          body_condition?: string | null
          brakes_condition?: string | null
          co_viewed_date?: string | null
          created_at?: string | null
          defects_corrected?: string[] | null
          defects_found?: string[] | null
          defects_pending?: string[] | null
          driver_servicing_efficiency?: string | null
          electrical_condition?: string | null
          engine_condition?: string | null
          form_type?: string | null
          forwarded_to_co?: boolean | null
          id?: string
          inspected_by_id?: string | null
          inspection_date?: string
          inspection_number?: string
          inspection_type?: string
          inspector_name?: string | null
          inspector_role?: string | null
          lights_condition?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          recommendation?: string | null
          serviceability_status?: string | null
          steering_condition?: string | null
          suspension_condition?: string | null
          tires_condition?: string | null
          transmission_condition?: string | null
          unit_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_inspected_by_id_fkey"
            columns: ["inspected_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          added_by: string | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          created_at: string | null
          fuel_type: string | null
          id: string
          last_service_date: string | null
          location: string | null
          make_model: string | null
          mileage: number | null
          next_service_due: string | null
          notes: string | null
          registration_number: string | null
          registration_status: string
          serial_number: string | null
          serviceability: string | null
          squadron_id: string | null
          updated_at: string | null
          vehicle_id: string
          vehicle_type: string
        }
        Insert: {
          added_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          last_service_date?: string | null
          location?: string | null
          make_model?: string | null
          mileage?: number | null
          next_service_due?: string | null
          notes?: string | null
          registration_number?: string | null
          registration_status?: string
          serial_number?: string | null
          serviceability?: string | null
          squadron_id?: string | null
          updated_at?: string | null
          vehicle_id: string
          vehicle_type: string
        }
        Update: {
          added_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          last_service_date?: string | null
          location?: string | null
          make_model?: string | null
          mileage?: number | null
          next_service_due?: string | null
          notes?: string | null
          registration_number?: string | null
          registration_status?: string
          serial_number?: string | null
          serviceability?: string | null
          squadron_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_physical_check_items: {
        Row: {
          check_id: string
          checked_at: string | null
          id: string
          weapon_id: string
        }
        Insert: {
          check_id: string
          checked_at?: string | null
          id?: string
          weapon_id: string
        }
        Update: {
          check_id?: string
          checked_at?: string | null
          id?: string
          weapon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapon_physical_check_items_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "weapon_physical_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapon_physical_check_items_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_physical_checks: {
        Row: {
          completed_at: string | null
          conducted_by: string
          id: string
          missing_count: number | null
          started_at: string
          status: string
          unit_id: string
        }
        Insert: {
          completed_at?: string | null
          conducted_by: string
          id?: string
          missing_count?: number | null
          started_at?: string
          status?: string
          unit_id: string
        }
        Update: {
          completed_at?: string | null
          conducted_by?: string
          id?: string
          missing_count?: number | null
          started_at?: string
          status?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapon_physical_checks_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapon_physical_checks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      weapons: {
        Row: {
          condition_issue: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          last_inspection_date: string | null
          mag_amount: number | null
          name: string | null
          next_inspection_due: string | null
          notes: string | null
          page_64_no: string | null
          rack_number: string | null
          rank: string | null
          return_date: string | null
          serial_number: string | null
          service_number: string | null
          serviceable: boolean | null
          squadron_id: string | null
          store_location: string | null
          survey_report_filed: boolean | null
          updated_at: string | null
          weapon_id: string
          weapon_type: string
        }
        Insert: {
          condition_issue?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          mag_amount?: number | null
          name?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          page_64_no?: string | null
          rack_number?: string | null
          rank?: string | null
          return_date?: string | null
          serial_number?: string | null
          service_number?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          store_location?: string | null
          survey_report_filed?: boolean | null
          updated_at?: string | null
          weapon_id: string
          weapon_type: string
        }
        Update: {
          condition_issue?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          last_inspection_date?: string | null
          mag_amount?: number | null
          name?: string | null
          next_inspection_due?: string | null
          notes?: string | null
          page_64_no?: string | null
          rack_number?: string | null
          rank?: string | null
          return_date?: string | null
          serial_number?: string | null
          service_number?: string | null
          serviceable?: boolean | null
          squadron_id?: string | null
          store_location?: string | null
          survey_report_filed?: boolean | null
          updated_at?: string | null
          weapon_id?: string
          weapon_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapons_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapons_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      works_materials: {
        Row: {
          authority: string | null
          created_at: string | null
          id: string
          material: string
          notes: string | null
          project_task: string
          quantity_issued: number | null
          quantity_received: number | null
          squadron_id: string | null
          updated_at: string | null
          voucher_id: string
        }
        Insert: {
          authority?: string | null
          created_at?: string | null
          id?: string
          material: string
          notes?: string | null
          project_task: string
          quantity_issued?: number | null
          quantity_received?: number | null
          squadron_id?: string | null
          updated_at?: string | null
          voucher_id: string
        }
        Update: {
          authority?: string | null
          created_at?: string | null
          id?: string
          material?: string
          notes?: string | null
          project_task?: string
          quantity_issued?: number | null
          quantity_received?: number | null
          squadron_id?: string | null
          updated_at?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "works_materials_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_inspections: {
        Row: {
          created_at: string | null
          defects_found: string[] | null
          equipment_id: string | null
          equipment_name: string | null
          equipment_reference: string | null
          equipment_type: string
          estimated_repair_cost: number | null
          id: string
          inspected_by_id: string | null
          inspection_date: string
          inspection_number: string
          inspection_status: string
          next_inspection_due: string | null
          notes: string | null
          repair_capacity: string | null
          repair_required: string | null
          report_submitted_date: string | null
          report_submitted_to_mto: boolean | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          defects_found?: string[] | null
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_reference?: string | null
          equipment_type: string
          estimated_repair_cost?: number | null
          id?: string
          inspected_by_id?: string | null
          inspection_date: string
          inspection_number: string
          inspection_status: string
          next_inspection_due?: string | null
          notes?: string | null
          repair_capacity?: string | null
          repair_required?: string | null
          report_submitted_date?: string | null
          report_submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          defects_found?: string[] | null
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_reference?: string | null
          equipment_type?: string
          estimated_repair_cost?: number | null
          id?: string
          inspected_by_id?: string | null
          inspection_date?: string
          inspection_number?: string
          inspection_status?: string
          next_inspection_due?: string | null
          notes?: string | null
          repair_capacity?: string | null
          repair_required?: string | null
          report_submitted_date?: string | null
          report_submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_inspections_inspected_by_id_fkey"
            columns: ["inspected_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_inspections_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_repairs: {
        Row: {
          civilian_firm_contact: string | null
          civilian_firm_name: string | null
          co_estimated_cost_approved: boolean | null
          co_funds_confirmed: boolean | null
          completion_certificate_url: string | null
          created_at: string | null
          equipment_id: string | null
          equipment_reference: string | null
          equipment_type: string
          id: string
          labor_cost: number | null
          notes: string | null
          parts_cost: number | null
          parts_required: string[] | null
          quality_check_passed: boolean | null
          quality_checked_by_id: string | null
          repair_completed_date: string | null
          repair_description: string
          repair_number: string
          repair_requested_date: string
          repair_started_date: string | null
          repair_status: string | null
          repair_type: string | null
          repaired_by_id: string | null
          reported_by_id: string | null
          total_cost: number | null
          unit_id: string | null
          updated_at: string | null
          work_order_number: string | null
        }
        Insert: {
          civilian_firm_contact?: string | null
          civilian_firm_name?: string | null
          co_estimated_cost_approved?: boolean | null
          co_funds_confirmed?: boolean | null
          completion_certificate_url?: string | null
          created_at?: string | null
          equipment_id?: string | null
          equipment_reference?: string | null
          equipment_type: string
          id?: string
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          parts_required?: string[] | null
          quality_check_passed?: boolean | null
          quality_checked_by_id?: string | null
          repair_completed_date?: string | null
          repair_description: string
          repair_number: string
          repair_requested_date: string
          repair_started_date?: string | null
          repair_status?: string | null
          repair_type?: string | null
          repaired_by_id?: string | null
          reported_by_id?: string | null
          total_cost?: number | null
          unit_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Update: {
          civilian_firm_contact?: string | null
          civilian_firm_name?: string | null
          co_estimated_cost_approved?: boolean | null
          co_funds_confirmed?: boolean | null
          completion_certificate_url?: string | null
          created_at?: string | null
          equipment_id?: string | null
          equipment_reference?: string | null
          equipment_type?: string
          id?: string
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          parts_required?: string[] | null
          quality_check_passed?: boolean | null
          quality_checked_by_id?: string | null
          repair_completed_date?: string | null
          repair_description?: string
          repair_number?: string
          repair_requested_date?: string
          repair_started_date?: string | null
          repair_status?: string | null
          repair_type?: string | null
          repaired_by_id?: string | null
          reported_by_id?: string | null
          total_cost?: number | null
          unit_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_repairs_quality_checked_by_id_fkey"
            columns: ["quality_checked_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_repairs_repaired_by_id_fkey"
            columns: ["repaired_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_repairs_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_repairs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_reports: {
        Row: {
          attachments: string[] | null
          civilian_tradesmen_performance: string | null
          created_at: string | null
          equipment_serviceable_count: number | null
          equipment_unserviceable_count: number | null
          id: string
          inspections_completed: number | null
          irregularities_reported: string[] | null
          mto_reviewed: boolean | null
          mto_reviewed_date: string | null
          personnel_training_completed: string[] | null
          recommendations: string | null
          repairs_completed: number | null
          repairs_pending: number | null
          repairs_referred: number | null
          report_content: string | null
          report_number: string
          report_period_end: string
          report_period_start: string
          report_type: string | null
          reported_by_id: string
          submitted_date: string | null
          submitted_to_mto: boolean | null
          unit_id: string | null
          updated_at: string | null
          workshop_efficiency_rating: string | null
        }
        Insert: {
          attachments?: string[] | null
          civilian_tradesmen_performance?: string | null
          created_at?: string | null
          equipment_serviceable_count?: number | null
          equipment_unserviceable_count?: number | null
          id?: string
          inspections_completed?: number | null
          irregularities_reported?: string[] | null
          mto_reviewed?: boolean | null
          mto_reviewed_date?: string | null
          personnel_training_completed?: string[] | null
          recommendations?: string | null
          repairs_completed?: number | null
          repairs_pending?: number | null
          repairs_referred?: number | null
          report_content?: string | null
          report_number: string
          report_period_end: string
          report_period_start: string
          report_type?: string | null
          reported_by_id: string
          submitted_date?: string | null
          submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          workshop_efficiency_rating?: string | null
        }
        Update: {
          attachments?: string[] | null
          civilian_tradesmen_performance?: string | null
          created_at?: string | null
          equipment_serviceable_count?: number | null
          equipment_unserviceable_count?: number | null
          id?: string
          inspections_completed?: number | null
          irregularities_reported?: string[] | null
          mto_reviewed?: boolean | null
          mto_reviewed_date?: string | null
          personnel_training_completed?: string[] | null
          recommendations?: string | null
          repairs_completed?: number | null
          repairs_pending?: number | null
          repairs_referred?: number | null
          report_content?: string | null
          report_number?: string
          report_period_end?: string
          report_period_start?: string
          report_type?: string | null
          reported_by_id?: string
          submitted_date?: string | null
          submitted_to_mto?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          workshop_efficiency_rating?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_reports_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_reports_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      consumption_7day_avg: {
        Row: {
          avg_daily_liters: number | null
          fuel_type: string | null
          label: string | null
          tank_id: string | null
          total_7_days: number | null
          transactions_7_days: number | null
        }
        Relationships: []
      }
      consumption_summary: {
        Row: {
          avg_daily_total: number | null
          min_days_remaining: number | null
          tanks_low_fuel: number | null
          total_today: number | null
        }
        Relationships: []
      }
      consumption_variance: {
        Row: {
          avg_daily_liters: number | null
          current_liters: number | null
          fuel_type: string | null
          label: string | null
          liters_today: number | null
          status: string | null
          tank_id: string | null
          transactions_today: number | null
          variance_percent: number | null
        }
        Relationships: []
      }
      daily_consumption: {
        Row: {
          fuel_type: string | null
          is_active: boolean | null
          label: string | null
          liters_today: number | null
          tank_id: string | null
          transactions_today: number | null
        }
        Relationships: []
      }
      tank_current_levels: {
        Row: {
          capacity_liters: number | null
          current_liters: number | null
          fuel_type: string | null
          has_opening: boolean | null
          id: string | null
          is_active: boolean | null
          label: string | null
          last_resupply_at: string | null
          percentage: number | null
        }
        Relationships: []
      }
      tank_days_remaining: {
        Row: {
          avg_daily_liters: number | null
          capacity_liters: number | null
          current_liters: number | null
          days_remaining: number | null
          fuel_type: string | null
          is_active: boolean | null
          label: string | null
          low_fuel_alert: boolean | null
          percentage: number | null
          projected_empty_date: string | null
          tank_id: string | null
          total_7_days: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      align_books_from_dip: { Args: { p_dip_id: string }; Returns: Json }
      approve_vehicle: {
        Args: {
          p_make_model?: string
          p_vehicle_id: string
          p_vehicle_type?: string
        }
        Returns: Json
      }
      can_view_scoped_row: {
        Args: {
          row_person_id?: string
          row_person_id2?: string
          row_unit_id: string
        }
        Returns: boolean
      }
      check_off_weapon: {
        Args: { p_check_id: string; p_weapon_id: string }
        Returns: Json
      }
      complete_physical_check: { Args: { p_check_id: string }; Returns: Json }
      confirm_dip_test: {
        Args: { p_dip_id: string; p_notes?: string }
        Returns: Json
      }
      detect_dip_gaps: { Args: never; Returns: Json }
      execute_clothing_exchange: {
        Args: {
          p_exchange_id: string
          p_items_to_return: string[]
          p_new_issue_ids: string[]
        }
        Returns: Json
      }
      get_dashboard_tanks: { Args: never; Returns: Json }
      get_dip_detail: { Args: { p_dip_id: string }; Returns: Json }
      get_email_by_service_number: {
        Args: { p_service_number: string }
        Returns: string
      }
      get_pending_vehicles: { Args: never; Returns: Json }
      get_recent_dips_rpc: {
        Args: { p_limit?: number }
        Returns: {
          book_level: number
          created_at: string
          dip_context: string
          dip_date: string
          dip_time: string
          discrepancy: number
          id: string
          is_reference_only: boolean
          measured_liters: number
          notes: string
          period_variance: number
          reading_suspect: boolean
          recorded_by: string
          severity: string
          tank_fuel_type: string
          tank_id: string
          tank_label: string
        }[]
      }
      get_user_unit_id: { Args: { uid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pol_adjust_fuel: {
        Args: { p_liters: number; p_reason: string; p_tank_id: string }
        Returns: Json
      }
      pol_issue_fuel: {
        Args: {
          p_driver_id?: string
          p_driver_name: string
          p_liters: number
          p_scan_method?: string
          p_tank_id: string
          p_vehicle_reg: string
        }
        Returns: Json
      }
      pol_resupply_fuel: {
        Args: {
          p_liters: number
          p_reference_number?: string
          p_supplier_name: string
          p_tank_id: string
        }
        Returns: Json
      }
      rank_ordinal: { Args: { p_rank: string }; Returns: number }
      record_dip_test: {
        Args: {
          p_dip_context?: string
          p_dip_time?: string
          p_measured_liters: number
          p_notes?: string
          p_tank_id: string
        }
        Returns: Json
      }
      reject_vehicle: { Args: { p_vehicle_id: string }; Returns: Json }
      resolve_explosives_change: {
        Args: { p_approve: boolean; p_notes?: string; p_request_id: string }
        Returns: Json
      }
      start_physical_check: { Args: { p_unit_id: string }; Returns: Json }
      submit_explosives_change: {
        Args: {
          p_action_type: string
          p_changes?: Json
          p_explosives_id?: string
          p_justification?: string
        }
        Returns: Json
      }
      user_has_unit_access: {
        Args: { check_unit_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "CO"
        | "S4"
        | "OC"
        | "SQMS"
        | "Soldier"
        | "S1"
        | "S4_ADMIN"
        | "STOREMAN"
        | "MTO"
        | "WKSP_WO"
        | "RSM"
      approval_status: "pending" | "approved" | "rejected"
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
      app_role: [
        "CO",
        "S4",
        "OC",
        "SQMS",
        "Soldier",
        "S1",
        "S4_ADMIN",
        "STOREMAN",
        "MTO",
        "WKSP_WO",
        "RSM",
      ],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
