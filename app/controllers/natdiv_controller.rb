class NatdivController < ApplicationController

  def render_json_array(jarray, count, offset)
    offset ||= 0
    render :json => {
      :count => count,
      :start => offset.to_i+1,
      :end => offset.to_i + jarray.length,
      :records => jarray
    }
  end

  def set_defaults(params)
    params[:l] ||= 50
    params[:o] ||= 0
    params[:l] = params[:l].to_i
    params[:o] = params[:o].to_i
#    params[:e] = (params[:o].to_i+params[:l].to_i)
    params[:format] ||= 'json'
    params[:return] ||= 'null'
    params
  end

end
