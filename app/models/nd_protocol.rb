class NdProtocol < ActiveRecord::Base

  has_many :nd_experiment_protocols
  has_many :nd_protocol_reagents
  has_many :nd_protocolprops

  validates_presence_of :name

  def as_json(options = {})
    {
      :name => self.name,
      :props => nd_protocolprops.as_json
    }
  end
end
