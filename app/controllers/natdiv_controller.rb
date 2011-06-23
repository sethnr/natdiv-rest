class NatdivController < ApplicationController

  def render_json_array(jarray, count, offset)
    offset ||= 0
    render :json => {
      :count => count,
      :start => offset.to_i,
      :end => offset.to_i + jarray.length,
      :records => jarray
    }
  end

  def set_defaults(params)
    params[:l] ||= 50
    params[:s] ||= 0
    params[:l] = params[:l].to_i
    params[:s] = params[:s].to_i
#    params[:e] = (params[:s].to_i+params[:l].to_i)
    params[:format] ||= 'json'
    params
  end

end
