class CvtermController < ApplicationController

  def index
     @cvterms = Cvterm.all
     respond_to do |format|
       format.html # index.html.erb
       format.json { render :json => @cvterms }
     end
  end


  def show
    @cvterm = Cvterm.find(params[:id])
    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @cvterm }
    end
  end

end
