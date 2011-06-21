class NdExperimentController < ApplicationController

  def index
     @experiments = NdExperiment.all
     respond_to do |format|
 #      format.html # index.html.erb
       format.json { render :json => @experiments }
       format.xml  { render :xml => @experiments }
     end
  end


  def show
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @experiment }
      format.xml  { render :xml => @experiment }
    end
  end

  def head
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @experiment.as_json_min() }
#      format.xml  { render :xml => @experiment }
    end
  end

  def stocks
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @experiment.stocks.collect{|s| s.as_json_min()} }
      format.xml  { render :xml => @experiment.stocks }
    end
  end

  def projects
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
#      format.html # index.html.erb
#      format.xml  { render :xml => @experiment }
      format.json { render :json => @experiment.projects.collect{|p| p.as_json_min()} }
      format.xml  { render :xml => @experiment.projects }
    end
  end
  
end
