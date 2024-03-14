export interface EventBriteEventsResponse {
  pagination: Pagination;
  events: EventBriteEvent[];
}

export interface EventBritePriceObject {
  currency: "USD" | string;
  major_value: string; // ex '60.00'
  value: number; // ex 6000
  display: string; // ex '60.00 USD'
}

export interface EventBriteEvent {
  name?: Description;
  description?: Description;
  url?: string;
  start?: End;
  end?: End;
  organization_id?: string;
  created?: Date;
  changed?: Date;
  published?: Date;
  capacity?: null;
  capacity_is_custom?: null;
  status?: string;
  currency?: string;
  listed?: boolean;
  shareable?: boolean;
  online_event?: boolean;
  tx_time_limit?: number;
  hide_start_date?: boolean;
  hide_end_date?: boolean;
  locale?: string;
  is_locked?: boolean;
  privacy_setting?: string;
  is_series?: boolean;
  is_series_parent?: boolean;
  inventory_type?: string;
  is_reserved_seating?: boolean;
  show_pick_a_seat?: boolean;
  show_seatmap_thumbnail?: boolean;
  show_colors_in_seatmap_thumbnail?: boolean;
  source?: string;
  is_free?: boolean;
  version?: null;
  summary?: string;
  facebook_event_id?: null;
  logo_id?: null | string;
  organizer_id?: string;
  venue_id?: string;
  vanue?: EventBriteVenue;
  category_id?: string;
  subcategory_id?: null | string;
  format_id?: string;
  id: string;
  resource_uri?: string;
  is_externally_ticketed?: boolean;
  logo?: Logo | null;
  ticket_availability?: {
    has_available_tickets: boolean;
    is_sold_out: boolean;
    minimum_ticket_price: EventBritePriceObject;
    maximum_ticket_price: EventBritePriceObject;
    start_sales_date: Date | null;
    waitlist_available: false;
  };
}

// https://www.eventbrite.com/platform/api#/reference/ticket-class/list/list-ticket-classes-by-event
export type EventBriteTicketClass = {
  id: string;
  description: string;
  donation: boolean;
  free: boolean;
  minimum_quantity: number;
  maximum_quantity: number;
  delivery_methods: any[];
  name: string;
  display_name: string;
};

export type EventBriteDiscount = {
  type: "access" | "coded" | "hold" | "public";
  code: string;
  amount_off: string;
  percent_off: string;
  event_id: EventBriteEvent["id"];
  ticket_class_ids: string[];
  quantity_available: number;
  start_date: string;
  start_date_relative: number;
  end_date: string;
  end_date_relative: number;
  ticket_group_id: string;
  hold_ids: string[];
};

export type EventBriteCosts = {
  base_price: {};
  eventbrite_fee: {};
  gross: {};
  payment_fee: {};
  tax: {};
};

export interface EventBriteAttendee {
  costs: EventBriteCosts;
  resource_uri: string;
  id: string;
  /** DateTime String */
  changed: string;
  /** DateTime String */
  created: string;
  quantity: number;
  variant_id: null;
  event?: EventBriteEvent;
  profile: {
    email: string;
  } & Record<string, any>;
  barcodes: {
    status: "used" | string;
    barcode: string;
    created: string; // '2023-11-28T01:56:38Z',
    changed: string; // '2023-11-28T03:09:30Z',
    checkin_type: 0 | number;
    checkin_method: "scan" | string;
    is_printed: boolean;
  }[];
  answers: any[];
  checked_in: boolean;
  cancelled: boolean;
  refunded: boolean;
  affiliate: string;
  status: "Checked In" | string;
  ticket_class_name: "Volunteer Comp" | string;
  event_id: string;
  order_id: string;
  ticket_class_id: string;
}

export type EventBriteOrder = {
  costs: EventBriteCosts;
  resource_uri: string;
  id: string;
  /** DateTime String */
  changed: string;
  /** DateTime String */
  created: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "placed" | string;
  time_remaining: number | null;
  event_id: string;
  attendees: EventBriteAttendee[];
  event: EventBriteEvent;
};

export interface Description {
  text: string;
  html: string;
}

export interface End {
  timezone: string;
  local: string;
  utc: string;
}

export interface Logo {
  crop_mask: CropMask | null;
  original: Original;
  id: string;
  url: string;
  aspect_ratio: string;
  edge_color: null | string;
  edge_color_set: boolean;
}

export interface CropMask {
  top_left: TopLeft;
  width: number;
  height: number;
}

export interface TopLeft {
  x: number;
  y: number;
}

export interface Original {
  url: string;
  width: number;
  height: number;
}

export interface Pagination {
  object_count: number;
  page_number: number;
  page_size: number;
  page_count: number;
  has_more_items: boolean;
}

export interface EventBriteVenue {
  address: Partial<EventBriteVenueAddress>;
  resource_uri: string;
  id: string;
  age_restriction: null;
  capacity: null;
  name: string;
  latitude: string;
  longitude: string;
}

export interface EventBriteVenueAddress {
  address_1: string;
  address_2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  localized_address_display: string;
  localized_area_display: string;
  localized_multi_line_address_display: string[];
}
