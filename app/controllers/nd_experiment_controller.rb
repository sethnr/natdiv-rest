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

  def head
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @experiment }
      format.json { render :json => @experiment.as_json_min() }
    end
  end

  def stocks
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @experiment }
      format.json { render :json => @experiment.stocks.as_json_min }
    end
  end

  def projects
    @experiment = NdExperiment.find(params[:id])
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @experiment }
      format.json { render :json => @experiment.projects.as_json_min }
    end
  end
  
end
