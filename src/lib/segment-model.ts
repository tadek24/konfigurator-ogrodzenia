import type {Segment,Project,Product} from './project';
/** Shared dimensions/materials for CAD, 3D and offer output. Segment fields are explicit overrides. */
export function segmentModel(segment:Segment,project:Project,catalog:Product[]){
 const product=catalog.find(p=>p.id===(segment.productId??segment.openingProductId??project.productId))??catalog.find(p=>p.id===project.productId)??catalog[0];
 const variant=product.variants?.find(v=>v.id===segment.variantId);
 return {product,variant,height:segment.height??variant?.height??project.height,color:segment.color??variant?.color??project.color,moduleWidth:variant?.width??product.moduleWidth};
}
