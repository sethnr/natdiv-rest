class NdProtocolprop < Prop

  belongs_to :nd_protocol

  validates_presence_of( :protocol_id, :cvterm_id )
end
