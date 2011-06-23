class ProjectController < NatdivController

  def index
#    params[:l] ||= 50
#    params[:o] ||= 0
    set_defaults(params)
    @projects = Project.find(:all, :limit => params[:l], :offset => params[:o])
#    set_defaults(params)
    
    respond_to do |format|
      format.json { render_json_array(@projects.collect{|p| p.as_json_min()}, Project.count, params[:o]) }
      format.xml  { render :xml => @project }
    end
  end

  def show
    @project = Project.find(params[:id])
    set_defaults(params)
    respond_to do |format|
#       format.html # index.html.erb
      format.json { render :json => @project }
      format.xml  { render :xml => @project }
    end
  end

  def head
    @project = Project.find(params[:id])
     respond_to do |format|
#       format.html # index.html.erb
#       format.xml  { render :xml => @project }
       format.json { render :json => @project.as_json_min() }
     end
  end

  def stocks
    @project = Project.find(params[:id])
    set_defaults(params)
     respond_to do |format|
#       format.html # index.html.erb
# figure out how to get subset of total & replace the inefficient select below:
      format.json { render_json_array( @project.stocks[params[:o],params[:l]].collect{|s| s.as_json_min()},
                                       @project.stocks.count,
                                       params[:o]) }
#      format.json { render :json => @project.nd_experiments.collect{|e| e.stocks}.flatten.uniq.collect{|s| s.as_json} }
      format.xml  { render :xml => @project.nd_experiments.collect{|e| e.stocks}.flatten.uniq }
     end
  end

  def experiments
    @project = Project.find(params[:id])
    set_defaults(params)
     respond_to do |format|
#       format.html 

# figure out how to get subset of total & replace the inefficient select below:
      format.json { render_json_array( @project.nd_experiments[params[:o],params[:l]].collect{ |e| e.as_json()} ,
                                       @project.nd_experiments.count,
                                       params[:o] ) }
      format.xml  { render :xml => @project.nd_experiments }
     end
  end


end
