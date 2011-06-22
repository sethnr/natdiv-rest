class NdExperimentController < NatdivController

  def index
    set_defaults(params)
    @experiments = NdExperiment.find(:all, :limit => params[:l], :offset => params[:s])
    respond_to do |format|
      format.json { render_json_array(@experiments.collect{|p| p.as_json_min()}, NdExperiment.count, params[:s]) }
      format.xml { render :xml => @experiments }
    end
  end

  def show
    @experiment = NdExperiment.find(params[:id])
    set_defaults(params)
    respond_to do |format|
#      format.html # index.html.erb
      
      format.json { render :json => @experiment }
      format.xml  { render :xml => @experiment }
    end
  end

  def head
    @experiment = NdExperiment.find(params[:id])
    set_defaults(params)
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @experiment.as_json_min() }
#      format.xml  { render :xml => @experiment }
    end
  end

  def stocks
    @experiment = NdExperiment.find(params[:id])
    set_defaults(params)
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render_json_array( @experiment.stocks[params[:s],params[:e]].collect{|s| s.as_json_min()},
                                      @experiment.stocks[params[:s],params[:e]].count,
                                      params[:s] ) }
#      format.json { render :json => @experiment.stocks.collect{|s| s.as_json_min()} }
      format.xml  { render :xml => @experiment.stocks }
    end
  end

  def projects
    @experiment = NdExperiment.find(params[:id])
    set_defaults(params)
    respond_to do |format|
#      format.html # index.html.erb
#      format.xml  { render :xml => @experiment }
# figure out how to get subset of total & replace the inefficient select below:
#      format.json { render :json => @experiment.projects.collect{|p| p.as_json_min()} }
      format.json { render_json_array( @experiment.projects[params[:s],params[:e]].collect{|s| s.as_json_min()},
                                       @experiment.projects[params[:s],params[:e]].count,
                                       params[:s] ) }
      format.xml  { render :xml => @experiment.projects }
    end
  end
  
end
