class NdGeolocationprop < Prop

  belongs_to :nd_geolocation

  validates_presence_of( :nd_geolocation_id, :type_id )
end
