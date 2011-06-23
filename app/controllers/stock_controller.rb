class StockController < NatdivController

  def index
    set_defaults(params)
    @stocks = Stock.find(:all, :limit => params[:l], :offset => params[:o])
    respond_to do |format|
      format.json { render_json_array(@stocks.collect{|p| p.as_json_min()}, Stock.count, params[:o]) }
      format.xml { render :xml => @stock }
    end
  end


  def show
    @stock = Stock.find(params[:id])
    set_defaults(params)
    respond_to do |format|
      #      format.html # index.html.erb
      format.json { render :json => @stock }
      format.xml  { render :xml => @stock }
    end
  end
  
  def head
    @stock = Stock.find(params[:id])
    set_defaults(params)
    respond_to do |format|
      #       format.html # index.html.erb
      #       format.xml  { render :xml => @stock }
      format.json { render :json => @stock.as_json_min() }
    end
  end
  
  def projects
    @stock = Stock.find(params[:id])
    set_defaults(params)
    respond_to do |format|
      #      format.html # index.html.erb
#      format.json { render :json => @stock.nd_experiments.collect{|e| e.projects}.flatten.uniq.collect{|p| p.as_json_min} }
      format.json { render_json_array( @stock.projects[params[:o],params[:l]].collect{|s| s.as_json_min()},
                                       @stock.projects.count,
                                       params[:o]) }
      format.xml  { render :xml => @stock.nd_experiments.collect{|e| e.projects}.flatten.uniq }
    end
  end
  
  def experiments
    @stock = Stock.find(params[:id])
    set_defaults(params)
    respond_to do |format|
      #      format.html # index.html.erb
      format.json { render_json_array( @stock.nd_experiments[params[:o],params[:l]].collect{|s| s.as_json_min()},
                                       @stock.nd_experiments.count,
                                       params[:o]) }
#      format.json { render :json => @stock.nd_experiments.limit(params[:l]).offset(params[:o]).as_json }
      format.xml  { render :xml => @stock.nd_experiments }
    end
  end
  

end
