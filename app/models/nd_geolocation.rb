class NdGeolocation < ActiveRecord::Base

  has_many :nd_experiments
  has_many :nd_geolocationprops


   def as_json(options = {})
    {
      :id => nd_geolocation_id,
      :description => description,
      :geodetic_datum => geodetic_datum,
      :latitude => latitude,
      :longitude => longitude,
      :altitude => altitude,
      :props => nd_geolocationprops.as_json
    }
   end
end
