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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged: boolean | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          recipient_role: Database["public"]["Enums"]["app_role"] | null
          sender_role: Database["public"]["Enums"]["app_role"] | null
          unit_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          sender_role?: Database["public"]["Enums"]["app_role"] | null
          unit_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
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
          rank: string | null
          unit_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id: string
          name: string
          rank?: string | null
          unit_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          rank?: string | null
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
      uniforms: {
        Row: {
          condition_issue: string | null
          condition_return: string | null
          created_at: string | null
          id: string
          issue_date: string | null
          issued_to: string | null
          item_name: string
          notes: string | null
          return_date: string | null
          serviceable: boolean | null
          size: string | null
          squadron_id: string | null
          uniform_id: string
          updated_at: string | null
        }
        Insert: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item_name: string
          notes?: string | null
          return_date?: string | null
          serviceable?: boolean | null
          size?: string | null
          squadron_id?: string | null
          uniform_id: string
          updated_at?: string | null
        }
        Update: {
          condition_issue?: string | null
          condition_return?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string | null
          issued_to?: string | null
          item_name?: string
          notes?: string | null
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
      vehicles: {
        Row: {
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
          serial_number: string | null
          serviceability: string | null
          squadron_id: string | null
          updated_at: string | null
          vehicle_id: string
          vehicle_type: string
        }
        Insert: {
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
          serial_number?: string | null
          serviceability?: string | null
          squadron_id?: string | null
          updated_at?: string | null
          vehicle_id: string
          vehicle_type: string
        }
        Update: {
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
          serial_number?: string | null
          serviceability?: string | null
          squadron_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
          vehicle_type?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "CO" | "S4" | "OC" | "SQMS" | "Soldier"
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
      app_role: ["CO", "S4", "OC", "SQMS", "Soldier"],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
