class NdExperimentController < ApplicationController

  def index
     @experiments = NdExperiment.all
 
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @experiments }
       format.json { render :json => @experiments }
     end
  end


  def show
    @experiment = NdExperiment.find(params[:id])
 
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @experiment }
      format.json { render :json => @experiment }
    end


  end

end
