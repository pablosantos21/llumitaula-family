import type { MealRecordStatus } from '../lib/meal-records-mapping';
import type { UserRole } from '../services/auth.service';
import type {
    ContactMethod,
    FamilyRequestType,
} from '../services/family-requests.service';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    role: UserRole;
                    active: boolean;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    role: UserRole;
                    active?: boolean;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    role?: UserRole;
                    active?: boolean;
                };
                Relationships: [];
            };
            schools: {
                Row: {
                    id: string;
                    name: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                };
                Relationships: [];
            };
            classes: {
                Row: {
                    id: string;
                    name: string;
                    school_id: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    school_id: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    school_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'classes_school_id_fkey';
                        columns: ['school_id'];
                        isOneToOne: true;
                        referencedRelation: 'schools';
                        referencedColumns: ['id'];
                    },
                ];
            };
            children: {
                Row: {
                    id: string;
                    first_name: string;
                    last_name: string;
                    class_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    first_name: string;
                    last_name: string;
                    class_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    first_name?: string;
                    last_name?: string;
                    class_id?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'children_class_id_fkey';
                        columns: ['class_id'];
                        isOneToOne: true;
                        referencedRelation: 'classes';
                        referencedColumns: ['id'];
                    },
                ];
            };
            menus: {
                Row: {
                    id: string;
                    first_course: string | null;
                    second_course: string | null;
                    side: string | null;
                    salad: string | null;
                    dessert: string | null;
                    type: string | null;
                };
                Insert: {
                    id?: string;
                    first_course?: string | null;
                    second_course?: string | null;
                    side?: string | null;
                    salad?: string | null;
                    dessert?: string | null;
                    type?: string | null;
                };
                Update: {
                    id?: string;
                    first_course?: string | null;
                    second_course?: string | null;
                    side?: string | null;
                    salad?: string | null;
                    dessert?: string | null;
                    type?: string | null;
                };
                Relationships: [];
            };
            menus_schools: {
                Row: {
                    menu_id: string;
                    school_id: string;
                    date: string;
                };
                Insert: {
                    menu_id: string;
                    school_id: string;
                    date: string;
                };
                Update: {
                    menu_id?: string;
                    school_id?: string;
                    date?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'menus_schools_menu_id_fkey';
                        columns: ['menu_id'];
                        isOneToOne: true;
                        referencedRelation: 'menus';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'menus_schools_school_id_fkey';
                        columns: ['school_id'];
                        isOneToOne: true;
                        referencedRelation: 'schools';
                        referencedColumns: ['id'];
                    },
                ];
            };
            meal_types: {
                Row: {
                    id: string;
                    name: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                };
                Relationships: [];
            };
            meal_records: {
                Row: {
                    id: string;
                    child_id: string;
                    recorded_date: string;
                    recorded_at: string;
                    status: MealRecordStatus;
                    notes: string | null;
                    meal_type_id: string;
                };
                Insert: {
                    id?: string;
                    child_id: string;
                    recorded_date: string;
                    recorded_at?: string;
                    status: MealRecordStatus;
                    notes?: string | null;
                    meal_type_id: string;
                };
                Update: {
                    id?: string;
                    child_id?: string;
                    recorded_date?: string;
                    recorded_at?: string;
                    status?: MealRecordStatus;
                    notes?: string | null;
                    meal_type_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'meal_records_child_id_fkey';
                        columns: ['child_id'];
                        isOneToOne: true;
                        referencedRelation: 'children';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'meal_records_meal_type_id_fkey';
                        columns: ['meal_type_id'];
                        isOneToOne: true;
                        referencedRelation: 'meal_types';
                        referencedColumns: ['id'];
                    },
                ];
            };
            incidents: {
                Row: {
                    id: string;
                    child_id: string;
                    date: string;
                    description: string;
                    created_at: string;
                    monitor_id: string | null;
                    reviewed: boolean | null;
                    requires_family_signature: boolean | null;
                    send_notification: boolean | null;
                    family_seen: boolean | null;
                    family_response: string | null;
                    family_responded_at: string | null;
                    monitor_validated: boolean | null;
                };
                Insert: {
                    id?: string;
                    child_id: string;
                    date: string;
                    description: string;
                    created_at?: string;
                    monitor_id?: string | null;
                    reviewed?: boolean | null;
                    requires_family_signature?: boolean | null;
                    send_notification?: boolean | null;
                    family_seen?: boolean | null;
                    family_response?: string | null;
                    family_responded_at?: string | null;
                    monitor_validated?: boolean | null;
                };
                Update: {
                    id?: string;
                    child_id?: string;
                    date?: string;
                    description?: string;
                    created_at?: string;
                    monitor_id?: string | null;
                    reviewed?: boolean | null;
                    requires_family_signature?: boolean | null;
                    send_notification?: boolean | null;
                    family_seen?: boolean | null;
                    family_response?: string | null;
                    family_responded_at?: string | null;
                    monitor_validated?: boolean | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'incidents_child_id_fkey';
                        columns: ['child_id'];
                        isOneToOne: true;
                        referencedRelation: 'children';
                        referencedColumns: ['id'];
                    },
                ];
            };
            family_requests: {
                Row: {
                    id: string;
                    child_id: string;
                    request_type: FamilyRequestType;
                    date: string;
                    message: string;
                    contact_method: ContactMethod | null;
                    contact_detail: string | null;
                    payload: Record<string, unknown>;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    child_id: string;
                    request_type: FamilyRequestType;
                    date: string;
                    message: string;
                    contact_method?: ContactMethod | null;
                    contact_detail?: string | null;
                    payload?: Record<string, unknown>;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    child_id?: string;
                    request_type?: FamilyRequestType;
                    date?: string;
                    message?: string;
                    contact_method?: ContactMethod | null;
                    contact_detail?: string | null;
                    payload?: Record<string, unknown>;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'family_requests_child_id_fkey';
                        columns: ['child_id'];
                        isOneToOne: true;
                        referencedRelation: 'children';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: Record<string, never>;
        Functions: {
            get_effective_capabilities: {
                Args: {
                    p_class_id: string | null;
                    p_child_id: string | null;
                };
                Returns: {
                    capability: string;
                    enabled: boolean;
                }[];
            };
        };
        Enums: {
            family_request_type: FamilyRequestType;
            contact_method: ContactMethod;
        };
        CompositeTypes: Record<string, never>;
    };
}
